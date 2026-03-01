/**
 * Edge Function: cancel-subscription
 * 
 * Cancela a assinatura do Mercado Pago (preapproval) e reembolsa se aplicável.
 * 
 * Fluxo:
 * 1. Busca o preapproval_id no banco (subscriptions.payment_id)
 * 2. Cancela o preapproval no MP via API
 * 3. Se houve cobrança, solicita reembolso
 * 4. Atualiza status no Supabase
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user_id } = await req.json()

        if (!user_id) {
            throw new Error('Missing user_id')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
        if (!accessToken) throw new Error('MP_ACCESS_TOKEN not configured');

        // 1. Buscar assinatura do usuário
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user_id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subError || !subscription) {
            // Tentar com status 'trialing' também
            const { data: trialSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user_id)
                .eq('status', 'trialing')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!trialSub) {
                throw new Error('Nenhuma assinatura ativa encontrada');
            }

            // Usar a trial subscription
            return await cancelAndRefund(supabase, trialSub, accessToken, user_id);
        }

        return await cancelAndRefund(supabase, subscription, accessToken, user_id);

    } catch (error) {
        console.error('❌ Cancel Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
});

async function cancelAndRefund(supabase: any, subscription: any, accessToken: string, userId: string) {
    const preapprovalId = subscription.payment_id;
    let mpCancelled = false;
    let refundStatus = 'not_applicable';

    // 2. Cancelar preapproval no Mercado Pago
    if (preapprovalId && preapprovalId !== 'local') {
        try {
            // Primeiro, tentar cancelar como preapproval (assinatura)
            const cancelResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' }),
            });

            const cancelData = await cancelResponse.json();

            if (cancelResponse.ok) {
                mpCancelled = true;
                console.log(`✅ Preapproval ${preapprovalId} cancelled in MP`);
            } else {
                console.log(`⚠️ Could not cancel preapproval: ${JSON.stringify(cancelData)}`);
                // Pode ser um payment_id antigo (não preapproval), tentar reembolso direto
            }

            // 3. Buscar pagamentos associados e verificar janela de reembolso (7 dias)
            const paymentsResponse = await fetch(
                `https://api.mercadopago.com/v1/payments/search?external_reference=${userId}&status=approved&sort=date_created&criteria=desc`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                }
            );

            const paymentsData = await paymentsResponse.json();

            if (paymentsData.results && paymentsData.results.length > 0) {
                const latestPayment = paymentsData.results[0];
                const paymentId = latestPayment.id;
                const paymentDate = new Date(latestPayment.date_created);
                const now = new Date();
                const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));

                console.log(`💳 Payment ${paymentId}: R$${latestPayment.transaction_amount}, ${daysSincePayment} days ago`);

                // Reembolso SÓ dentro de 7 dias da cobrança
                if (daysSincePayment <= 7) {
                    console.log(`✅ Within 7-day refund window. Processing refund...`);

                    const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({}),
                    });

                    const refundData = await refundResponse.json();

                    if (refundResponse.ok || refundResponse.status === 201) {
                        refundStatus = 'refunded';
                        console.log(`✅ Refund processed: R$${refundData.amount || latestPayment.transaction_amount}`);
                    } else {
                        refundStatus = 'refund_failed';
                        console.log(`⚠️ Refund failed: ${JSON.stringify(refundData)}`);
                    }
                } else {
                    refundStatus = 'outside_refund_window';
                    console.log(`⏰ Payment is ${daysSincePayment} days old. Outside 7-day refund window. No refund.`);
                }
            } else {
                refundStatus = 'no_payments_found';
                console.log('ℹ️ No approved payments found (trial only?)');
            }

        } catch (mpError) {
            console.error('MP API error:', mpError);
            // Continuar com cancelamento local mesmo se MP falhar
        }
    }

    // 4. Atualizar status no Supabase
    await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            auto_renew: false,
        })
        .eq('user_id', userId);

    // 5. Revogar acesso
    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { tier: 'free' }
    });
    await supabase.from('profiles').update({ tier: 'free' }).eq('id', userId);

    console.log(`🔒 Access revoked for user ${userId}`);

    return new Response(
        JSON.stringify({
            success: true,
            mp_cancelled: mpCancelled,
            refund_status: refundStatus,
            message: refundStatus === 'refunded'
                ? 'Assinatura cancelada e reembolso processado!'
                : refundStatus === 'outside_refund_window'
                    ? 'Assinatura cancelada. O prazo de 7 dias para reembolso já passou.'
                    : refundStatus === 'no_payments_found'
                        ? 'Assinatura cancelada. Nenhuma cobrança foi feita (trial).'
                        : 'Assinatura cancelada.'
        }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        },
    );
}
