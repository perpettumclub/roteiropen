// supabase/functions/send-verification-code/index.ts
// Edge Function para enviar código de verificação de email via Resend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email } = await req.json()

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Email é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        // Set expiration to 10 minutes from now
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

        // Delete any existing codes for this email
        await supabase
            .from('email_verification_codes')
            .delete()
            .eq('email', email)

        // Insert new code
        const { error: insertError } = await supabase
            .from('email_verification_codes')
            .insert({
                email,
                code,
                expires_at: expiresAt,
            })

        if (insertError) {
            console.error('Error inserting code:', insertError)
            return new Response(
                JSON.stringify({ error: 'Erro ao gerar código' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Send email via Resend
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured')
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
        .code-box { background-color: #f5f5f7; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .code { font-size: 38px; font-weight: 400; letter-spacing: 4px; color: #111111; }
        .footer-text { font-size: 14px; color: #333333; line-height: 20px; }
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
        <h1 class="title">Confirme seu email</h1>
        <p class="text">
            Olá,<br><br>
            Use o código abaixo para confirmar seu email e acessar o Hooky:
        </p>
        <div class="code-box">
            <span class="code">${code}</span>
        </div>
        <p class="footer-text">
            Este código expira em 10 minutos.<br><br>
            Se você não solicitou este código, pode ignorar este email.
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
                subject: 'Seu código de verificação - Hooky',
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

        console.log(`✅ Email sent to ${email}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Código enviado para seu email' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

