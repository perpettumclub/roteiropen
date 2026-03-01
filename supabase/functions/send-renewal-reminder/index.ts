// supabase/functions/send-renewal-reminder/index.ts
// Edge Function para enviar lembrete de renovação 7 dias antes da expiração

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
        const { email, expiresAt, userName } = await req.json()

        if (!email || !expiresAt) {
            return new Response(
                JSON.stringify({ error: 'Email e data de expiração são obrigatórios' }),
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

        const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
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
        .highlight-box { background-color: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .date { font-size: 18px; font-weight: 600; color: #E53E3E; }
        .button { display: inline-block; background-color: #FF6B6B; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 16px; }
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
        
        <h1 class="title">Sua assinatura está prestes a expirar</h1>
        
        <p class="text">
            Olá${userName ? `, ${userName}` : ''}!<br><br>
            Sua assinatura do Hooky expira em <strong>7 dias</strong>. Não perca acesso aos seus roteiros virais!
        </p>
        
        <div class="highlight-box">
            <span style="color: #666; font-size: 14px;">Data de expiração:</span><br>
            <span class="date">${expirationDate}</span>
        </div>
        
        <p class="text">
            Renove agora e continue criando conteúdo que converte:
        </p>
        
        <div style="text-align: center;">
            <a href="https://hooky.ai/renovar" class="button">
                Renovar Assinatura
            </a>
        </div>
        
        <p class="footer-text" style="margin-top: 24px;">
            Se você tiver alguma dúvida, responda este email que teremos prazer em ajudar.
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
                subject: '⏰ Sua assinatura Hooky expira em 7 dias',
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

        console.log(`✅ Renewal reminder sent to ${email}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Lembrete enviado' }),
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
