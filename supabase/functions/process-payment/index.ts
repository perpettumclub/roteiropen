/**
 * Process Payment - Edge Function
 * 
 * Recebe o token do cartão do frontend (CardPayment) e processa
 * o pagamento usando a API de Payments do Mercado Pago.
 * 
 * Depois de aprovado, cria/atualiza a assinatura no banco.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verificar autenticação
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Não autorizado')
        }

        // Criar cliente Supabase com service role para operações privilegiadas
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            { auth: { persistSession: false } }
        )

        // Verificar o usuário pelo token JWT
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_ANON_KEY') || '',
            {
                global: { headers: { Authorization: authHeader } },
                auth: { persistSession: false }
            }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            throw new Error('Usuário não autenticado')
        }

        // 2. Pegar dados do pagamento do body
        const {
            token,
            payment_method_id,
            installments = 1,
            issuer_id,
            payer,
            amount,
            plan = 'annual'
        } = await req.json()

        if (!token || !payment_method_id) {
            throw new Error('Dados de pagamento incompletos')
        }

        // 3. Inicializar Mercado Pago
        const client = new MercadoPagoConfig({
            accessToken: Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || '',
            options: { timeout: 30000 }
        })

        const paymentClient = new Payment(client)

        // 4. Criar o pagamento
        const paymentData = {
            transaction_amount: amount,
            token: token,
            description: `Assinatura Hooky - Plano ${plan}`,
            installments: Number(installments),
            payment_method_id: payment_method_id,
            issuer_id: issuer_id ? Number(issuer_id) : undefined,
            payer: {
                email: payer?.email || user.email,
                identification: payer?.identification
            },
            metadata: {
                user_id: user.id,
                plan: plan
            }
        }

        console.log('Creating payment:', { ...paymentData, token: '[REDACTED]' })

        const result = await paymentClient.create({ body: paymentData })

        console.log('Payment result:', {
            id: result.id,
            status: result.status,
            status_detail: result.status_detail
        })

        // 5. Se pagamento aprovado ou pendente, criar/atualizar assinatura
        if (result.status === 'approved' || result.status === 'in_process' || result.status === 'pending') {
            // Calcular data de expiração
            let expiresAt: Date
            if (plan === 'annual') {
                expiresAt = new Date()
                expiresAt.setFullYear(expiresAt.getFullYear() + 1)
            } else if (plan === 'monthly') {
                expiresAt = new Date()
                expiresAt.setMonth(expiresAt.getMonth() + 1)
            } else {
                // lifetime - 100 anos
                expiresAt = new Date()
                expiresAt.setFullYear(expiresAt.getFullYear() + 100)
            }

            const subscriptionStatus = result.status === 'approved' ? 'active' : 'pending'

            // Upsert na tabela subscriptions
            const { error: subError } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    status: subscriptionStatus,
                    plan: plan,
                    price_paid: amount,
                    mercadopago_payment_id: String(result.id),
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (subError) {
                console.error('Error saving subscription:', subError)
                // Não vamos falhar o pagamento por causa disso
            } else {
                console.log('Subscription saved for user:', user.id)
            }
        }

        // 6. Retornar resultado
        return new Response(
            JSON.stringify({
                id: result.id,
                status: result.status,
                status_detail: result.status_detail,
                payment_method_id: result.payment_method_id,
                date_approved: result.date_approved
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Payment error:', error)

        return new Response(
            JSON.stringify({
                error: error.message || 'Erro ao processar pagamento',
                status: 'error'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
