/**
 * Mercado Pago Webhook Handler
 * 
 * Handles both:
 * 1. Payment notifications (one-time payments, legacy)
 * 2. Subscription preapproval notifications (new trial flow)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse Webhook Header para validação de assinatura
        const signature = req.headers.get('x-signature');
        const requestId = req.headers.get('x-request-id');
        const mpSecret = Deno.env.get('MP_WEBHOOK_SECRET');

        // Parse da URL e parametros padrão
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        // Validação estrita de assinatura (Spoofing Protection)
        if (mpSecret && signature && id) {
            // x-signature tem o formato: ts=123456,v1=abcdefg
            const tsMatch = signature.match(/ts=([^,]+)/);
            const v1Match = signature.match(/v1=([^,]+)/);

            if (tsMatch && v1Match) {
                const ts = tsMatch[1];
                const receivedHash = v1Match[1];

                const manifest = `id:${id};request-id:${requestId};ts:${ts};`;

                // Usando Deno.crypto para criar HMAC SHA256
                const encoder = new TextEncoder();
                const key = await crypto.subtle.importKey(
                    "raw",
                    encoder.encode(mpSecret),
                    { name: "HMAC", hash: "SHA-256" },
                    false,
                    ["sign"]
                );

                const signatureBuffer = await crypto.subtle.sign(
                    "HMAC",
                    key,
                    encoder.encode(manifest)
                );

                // Convert buffer to hex string manually
                const hashArray = Array.from(new Uint8Array(signatureBuffer));
                const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (computedHash !== receivedHash) {
                    console.error('🚨 Invalid Webhook Signature detected. Possible spoofing attack.');
                    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                        status: 401,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }
            } else {
                console.warn('⚠️ Webhook missing required signature parts.');
            }
        } else if (!signature && Deno.env.get('DENO_ENV') !== 'development') {
            console.warn('⚠️ Webhook received without x-signature in production-like environment.');
        }

        // Initialize Supabase Admin AFTER validation
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Se veio JSON no body
        let payload: any = {};
        try { payload = await req.json() } catch (e) { }

        const eventId = id || payload.data?.id || payload.id;
        const eventType = topic || payload.type;

        console.log(`📩 Webhook received. Type: ${eventType}, ID: ${eventId}`);

        // =====================================================================
        // SUBSCRIPTION PREAPPROVAL (Trial + Assinatura)
        // =====================================================================
        if (eventType === 'subscription_preapproval' && eventId) {
            return await handleSubscriptionEvent(supabaseAdmin, eventId);
        }

        // =====================================================================
        // PAYMENT (Cobrança recorrente ou pagamento avulso)
        // =====================================================================
        if ((eventType === 'payment' || payload.type === 'payment') && eventId) {
            return await handlePaymentEvent(supabaseAdmin, eventId);
        }

        return new Response(JSON.stringify({ message: 'Ignored' }), { status: 200 });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

// =============================================================================
// HANDLER: Subscription Preapproval
// =============================================================================
async function handleSubscriptionEvent(supabaseAdmin: any, preapprovalId: string) {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('MP Token not set');

    // Consultar dados da assinatura no MP
    const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const subData = await response.json();
    console.log(`📋 Subscription ${preapprovalId}: status=${subData.status}`);

    const userId = subData.external_reference;
    if (!userId) {
        console.error('⚠️ No external_reference (user_id) in subscription');
        return new Response(JSON.stringify({ message: 'No user reference' }), { status: 200 });
    }

    // =====================================================================
    // STATUS HANDLING
    // =====================================================================

    if (subData.status === 'authorized') {
        // ✅ Assinatura autorizada (trial começou OU pagamento confirmado)
        console.log(`✅ Subscription authorized for user: ${userId}`);

        // Calcular data de expiração (1 ano a partir de agora)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Atualizar subscription
        await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            status: 'active',
            plan_name: 'anual',
            plan_price: subData.auto_recurring?.transaction_amount || 49.90,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            payment_id: String(preapprovalId),
            auto_renew: true
        }, { onConflict: 'user_id' });

        // Liberar acesso
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { tier: 'hooky_pro' }
        });
        await supabaseAdmin.from('profiles').update({ tier: 'hooky_pro' }).eq('id', userId);

        // Enviar email de boas-vindas
        await sendWelcomeEmail(supabaseAdmin, userId, subData);

        return new Response(JSON.stringify({ message: 'Access granted (subscription)' }), { status: 200 });
    }

    if (subData.status === 'paused' || subData.status === 'cancelled') {
        // ❌ Assinatura pausada ou cancelada
        console.log(`❌ Subscription ${subData.status} for user: ${userId}`);

        await supabaseAdmin.from('subscriptions')
            .update({ status: subData.status, auto_renew: false })
            .eq('user_id', userId);

        // Remover acesso
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { tier: 'free' }
        });
        await supabaseAdmin.from('profiles').update({ tier: 'free' }).eq('id', userId);

        return new Response(JSON.stringify({ message: `Access revoked (${subData.status})` }), { status: 200 });
    }

    if (subData.status === 'pending') {
        // ⏳ Aguardando (trial ainda não confirmou cartão)
        console.log(`⏳ Subscription pending for user: ${userId}`);
        return new Response(JSON.stringify({ message: 'Subscription pending' }), { status: 200 });
    }

    console.log(`ℹ️ Unhandled subscription status: ${subData.status}`);
    return new Response(JSON.stringify({ message: `Status: ${subData.status}` }), { status: 200 });
}

// =============================================================================
// HANDLER: Payment (Legacy + Recorrente)
// =============================================================================
async function handlePaymentEvent(supabaseAdmin: any, paymentId: string) {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('MP Token not set');

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== 'approved' && paymentData.status !== 'completed') {
        return new Response(JSON.stringify({ message: 'Payment not approved yet' }), { status: 200 });
    }

    // --- DADOS DA COMPRA ---
    const transactionAmount = paymentData.transaction_amount || 0;
    const email = paymentData.payer?.email;
    const fullName = paymentData.payer?.first_name ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}` : 'Membro';
    const userIdFromReference = paymentData.external_reference;

    // Definir Produto
    let productType: 'course' | 'subscription' = 'course';
    let tierToGrant = 'desafio_vip';
    let planName = 'desafio_vsl';

    if (transactionAmount < 100) {
        productType = 'subscription';
        tierToGrant = 'hooky_pro';
        planName = 'anual';
        console.log(`💳 Payment: App Subscription (R$${transactionAmount})`);
    } else {
        productType = 'course';
        tierToGrant = 'desafio_vip';
        planName = 'desafio_vsl';
        console.log(`💳 Payment: Course (R$${transactionAmount})`);
    }

    // --- ENCONTRAR OU CRIAR USUÁRIO ---
    let user: any;
    let isNewUser = false;
    let tempPassword = '';

    if (userIdFromReference) {
        const { data: { user: byId }, error } = await supabaseAdmin.auth.admin.getUserById(userIdFromReference);
        if (byId && !error) user = byId;
    }

    if (!user && email) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        user = users.find((u: any) => u.email === email);
    }

    if (!user) {
        if (!email) throw new Error('Cannot create user: No email provided');

        isNewUser = true;
        tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (createError) throw createError;
        user = newUser.user;
    }

    console.log(`🔑 Processing access for User ID: ${user.id}`);

    // --- LIBERAR ACESSO ---
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { tier: tierToGrant }
    });
    await supabaseAdmin.from('profiles').update({ tier: tierToGrant }).eq('id', user.id);

    // Registrar na Tabela de Assinaturas
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabaseAdmin.from('subscriptions').upsert({
        user_id: user.id,
        status: 'active',
        plan_name: planName,
        plan_price: transactionAmount,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_id: String(paymentId),
        auto_renew: productType === 'subscription'
    }, { onConflict: 'user_id' });

    // --- ENVIAR EMAIL ---
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey && email) {
        const emailHtml = getEmailTemplate(fullName, email, tempPassword, isNewUser, productType);
        const subject = productType === 'course'
            ? (isNewUser ? '🚀 Seu acesso ao Desafio 45 chegou!' : '🚀 Upgrade Confirmado - Desafio 45 Dias')
            : (isNewUser ? '📱 Bem-vindo ao App Hooky AI!' : '📱 Assinatura App Confirmada!');

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Hooky AI <onboarding@resend.dev>',
                to: email,
                subject: subject,
                html: emailHtml,
            }),
        });
        console.log('📧 Confirmation email sent.');
    }

    return new Response(JSON.stringify({ success: true, user_id: user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });
}

// =============================================================================
// HELPERS
// =============================================================================

async function sendWelcomeEmail(supabaseAdmin: any, userId: string, subData: any) {
    try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) return;

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!user?.email) return;

        const name = user.user_metadata?.full_name || 'Membro';
        const price = subData.auto_recurring?.transaction_amount || 49.90;

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Hooky AI <onboarding@resend.dev>',
                to: user.email,
                subject: '🎉 Seu trial de 3 dias começou!',
                html: `
                    <div style="font-family: 'Helvetica', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px; background: #fff; border-radius: 20px;">
                        <h2>Olá, ${name}! 🚀</h2>
                        <p>Seu <strong>trial de 3 dias grátis</strong> do Hooky AI está ativo!</p>
                        <p>Após o período de teste, você será cobrado <strong>R$ ${price.toFixed(2).replace('.', ',')}/ano</strong> automaticamente.</p>
                        <p>Se não quiser continuar, cancele a qualquer momento antes do 3º dia.</p>
                        <center><a href="https://hookyai.com.br/app/gravar" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Começar a Criar →</a></center>
                    </div>
                `,
            }),
        });
        console.log('📧 Welcome/trial email sent.');
    } catch (e) {
        console.error('Email error:', e);
    }
}

function getEmailTemplate(name: string, email: string, password: string, isNewAccount: boolean, productType: 'course' | 'subscription') {
    const credentialsSection = isNewAccount ? `
        <div style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Suas credenciais de acesso:</p>
            <div style="margin-bottom: 8px;">
                <span style="color: #666; font-size: 13px;">Login:</span><br>
                <strong style="color: #333; font-size: 16px;">${email}</strong>
            </div>
            <div>
                <span style="color: #666; font-size: 13px;">Senha Provisória:</span><br>
                <strong style="color: #333; font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 4px;">${password}</strong>
            </div>
        </div>
    ` : `
        <div style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 15px; color: #333;">
                <strong>Acesso Liberado!</strong><br>
                Como você já tem conta, basta entrar com seu login atual.
            </p>
        </div>
    `;

    const welcomeMessage = productType === 'course'
        ? `Pagamento confirmado! O <strong>Desafio 45 Dias</strong> já está disponível na sua área de membros.`
        : `Sua assinatura do <strong>Hooky AI</strong> está ativa! Comece a criar seus roteiros agora.`;

    const buttonText = productType === 'course' ? 'Acessar Área de Membros →' : 'Acessar App Agora →';
    const targetUrl = productType === 'course' ? 'https://hookyai.com.br/membros' : 'https://hookyai.com.br/app/gravar';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica', sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0; }
        .container { max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 48px; border: 1px solid #eee; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Olá, ${name}! 🚀</h2>
        <p>${welcomeMessage}</p>
        ${credentialsSection}
        <center><a href="${targetUrl}" class="button">${buttonText}</a></center>
    </div>
</body>
</html>
    `
}
