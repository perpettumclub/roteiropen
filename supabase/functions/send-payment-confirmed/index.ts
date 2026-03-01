// supabase/functions/send-payment-confirmed/index.ts
// Email de confirmação de pagamento

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
        const { email, planName, amount, paymentDate, transactionId } = await req.json()

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Email é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (!resendApiKey) {
            return new Response(
                JSON.stringify({ error: 'Serviço de email não configurado' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const formattedDate = new Date(paymentDate || Date.now()).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })

        const formattedAmount = (amount || 49.90).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0; }
        .container { max-width: 440px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 48px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
        .logo { margin-bottom: 36px; text-align: left; }
        .title { font-size: 22px; font-weight: 600; color: #333333; margin-bottom: 28px; }
        .text { font-size: 15px; line-height: 22px; color: #333333; margin-bottom: 24px; }
        .receipt-box { background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .receipt-row:last-child { border-bottom: none; font-weight: 600; }
        .success-badge { display: inline-flex; align-items: center; gap: 6px; background: #D1FAE5; color: #065F46; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
        .footer-text { font-size: 14px; color: #666666; line-height: 20px; }
        .powered { text-align: left; margin-top: 24px; font-size: 11px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 28px;">🎤</span>
                <span style="font-size: 20px; font-weight: 700; color: #FF6B6B;">Hooky</span>
            </div>
        </div>
        <div class="success-badge">
            ✓ Pagamento Confirmado
        </div>
        <h1 class="title">Recibo de Pagamento</h1>
        <p class="text">
            Obrigado pela sua compra! Aqui estão os detalhes do seu pagamento:
        </p>
        <div class="receipt-box">
            <div class="receipt-row">
                <span style="color: #666;">Plano</span>
                <span style="color: #333;">${planName || 'Anual'}</span>
            </div>
            <div class="receipt-row">
                <span style="color: #666;">Data</span>
                <span style="color: #333;">${formattedDate}</span>
            </div>
            <div class="receipt-row">
                <span style="color: #666;">ID da transação</span>
                <span style="color: #333; font-size: 12px;">${transactionId || 'N/A'}</span>
            </div>
            <div class="receipt-row">
                <span style="color: #333;">Total</span>
                <span style="color: #10B981;">${formattedAmount}</span>
            </div>
        </div>
        <p class="footer-text">
            Este é seu comprovante de pagamento. Guarde-o para referência futura.<br><br>
            Se tiver dúvidas sobre sua cobrança, responda este email.
        </p>
        <div class="powered">
            Powered by <span style="font-weight: 700; color: #FF6B6B; margin-left: 2px;">Hooky</span>
        </div>
    </div>
</body>
</html>`

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Hooky <noreply@hookyai.com.br>',
                to: email,
                subject: '✓ Pagamento confirmado - Hooky',
                html: emailHtml,
            }),
        })

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text()
            console.error('Resend error:', errorData)
            return new Response(
                JSON.stringify({ error: 'Erro ao enviar email' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`✅ Payment confirmation sent to ${email}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Recibo enviado' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: 'Erro interno' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
