// supabase/functions/send-challenge-welcome/index.ts
// Email de boas-vindas específico para o Desafio 45 Dias

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
        const { email, userName, password } = await req.json()

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

        const credentialsSection = password ? `
        <div class="credentials-box">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">Suas credenciais de acesso:</p>
            <div style="margin-bottom: 12px;">
                <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Login:</span><br>
                <a href="mailto:${email}" style="color: #2563EB; font-weight: 500; text-decoration: none;">${email}</a>
            </div>
            <div>
                <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Senha Provisória:</span><br>
                <div style="display: inline-block; background: #E5E7EB; color: #1F2937; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; margin-top: 4px;">${password}</div>
            </div>
        </div>
        ` : '';

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0; }
        .container { max-width: 440px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 48px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
        .logo { margin-bottom: 36px; text-align: left; }
        .title { font-size: 24px; font-weight: 700; color: #1F2937; margin-bottom: 24px; letter-spacing: -0.5px; }
        .text { font-size: 15px; line-height: 24px; color: #333333; margin-bottom: 24px; }
        .credentials-box { background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background-color: #FF6B6B; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; width: 100%; box-sizing: border-box; text-align: center; }
        .footer-text { font-size: 14px; color: #666666; line-height: 20px; }
        .powered { text-align: left; margin-top: 24px; font-size: 11px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="https://hookyai.com.br/logo3hooky.png" width="40" height="40" alt="Hooky" style="display: block; width: 40px; height: 40px; margin-right: 12px;">
                <span style="font-size: 24px; font-weight: 700; color: #111111; letter-spacing: -0.5px; line-height: 40px;">Hooky</span>
            </div>
        </div>
        
        <h1 class="title">Bem-vindo(a) ao Desafio 45 Dias! 🚀</h1>
        
        <p class="text">
            Olá${userName ? `, ${userName}` : ''}!<br><br>
            Seu pagamento foi confirmado e seu acesso exclusivo à Área de Membros já está liberado. Estamos muito felizes em ter você nessa jornada.
        </p>
        
        ${credentialsSection}
        
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://hookyai.com.br/membros" class="button">Acessar Área de Membros →</a>
        </div>
        
        <p class="footer-text">
            Se tiver qualquer dúvida ou precisar de ajuda para acessar, basta responder este email.
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
                subject: '🚀 Bem-vindo ao Desafio 45 Dias! Seus dados de acesso',
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

        console.log(`✅ Challenge welcome email sent to ${email}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Email de desafio enviado' }),
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
