// supabase/functions/send-welcome-email/index.ts
// Email de boas-vindas após pagamento aprovado

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
        const { email, userName } = await req.json()

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
        .feature-box { background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .feature-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .feature-item:last-child { margin-bottom: 0; }
        .button { display: inline-block; background-color: #FF6B6B; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; }
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
        <h1 class="title">Bem-vindo ao Hooky! 🎉</h1>
        <p class="text">
            Olá${userName ? `, ${userName}` : ''}!<br><br>
            Sua assinatura foi ativada com sucesso. Agora você tem acesso ilimitado para criar roteiros virais!
        </p>
        <div class="feature-box">
            <div class="feature-item">
                <span style="font-size: 18px;">🎙️</span>
                <span style="font-size: 14px; color: #333;">Grave suas ideias em áudio</span>
            </div>
            <div class="feature-item">
                <span style="font-size: 18px;">✨</span>
                <span style="font-size: 14px; color: #333;">IA transforma em roteiros virais</span>
            </div>
            <div class="feature-item">
                <span style="font-size: 18px;">📈</span>
                <span style="font-size: 14px; color: #333;">Acompanhe seu progresso</span>
            </div>
            <div class="feature-item">
                <span style="font-size: 18px;">🔥</span>
                <span style="font-size: 14px; color: #333;">Conquiste badges exclusivos</span>
            </div>
        </div>
        <div style="text-align: center;">
            <a href="https://hookyai.com.br/app/gravar" class="button">Começar Agora</a>
        </div>
        <p class="footer-text" style="margin-top: 24px;">
            Se precisar de ajuda, responda este email. Estamos aqui para você!
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
                subject: '🎉 Bem-vindo ao Hooky! Sua jornada começa agora',
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

        console.log(`✅ Welcome email sent to ${email}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Email de boas-vindas enviado' }),
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
