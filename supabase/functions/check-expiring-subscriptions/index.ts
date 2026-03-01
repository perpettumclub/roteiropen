// supabase/functions/check-expiring-subscriptions/index.ts
// Cron Job: Roda diariamente para enviar lembretes de renovação

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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Calcular data de 7 dias no futuro
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        const targetDate = sevenDaysFromNow.toISOString().split('T')[0] // YYYY-MM-DD

        // Buscar assinaturas que expiram em 7 dias
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('user_id, expires_at, users:user_id(email)')
            .gte('expires_at', `${targetDate}T00:00:00`)
            .lt('expires_at', `${targetDate}T23:59:59`)
            .eq('status', 'active')

        if (error) {
            console.error('Error fetching subscriptions:', error)
            throw error
        }

        console.log(`📧 Found ${subscriptions?.length || 0} subscriptions expiring in 7 days`)

        let sentCount = 0

        for (const sub of subscriptions || []) {
            const email = (sub as any).users?.email
            if (!email || !resendApiKey) continue

            // Enviar email de lembrete
            const expirationDate = new Date(sub.expires_at).toLocaleDateString('pt-BR', {
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
        <h1 class="title">Sua assinatura expira em 7 dias</h1>
        <p class="text">
            Olá!<br><br>
            Sua assinatura do Hooky está prestes a expirar. Não perca acesso aos seus roteiros virais!
        </p>
        <div class="highlight-box">
            <span style="color: #666; font-size: 14px;">Data de expiração:</span><br>
            <span class="date">${expirationDate}</span>
        </div>
        <p class="text">
            Renove agora e continue criando conteúdo que converte:
        </p>
        <div style="text-align: center;">
            <a href="https://hooky.ai/renovar" class="button">Renovar Assinatura</a>
        </div>
        <p class="footer-text" style="margin-top: 24px;">
            Se você tiver alguma dúvida, responda este email.
        </p>
        <div class="powered">
            Powered by <span style="font-weight: 700; color: #FF6B6B; margin-left: 2px;">Hooky</span>
        </div>
    </div>
</body>
</html>`

            try {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Hooky <onboarding@resend.dev>',
                        to: email,
                        subject: '⏰ Sua assinatura Hooky expira em 7 dias',
                        html: emailHtml,
                    }),
                })

                if (res.ok) {
                    sentCount++
                    console.log(`✅ Reminder sent to ${email}`)
                }
            } catch (e) {
                console.error(`Failed to send to ${email}:`, e)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Enviados ${sentCount} lembretes`,
                checked: subscriptions?.length || 0
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: 'Erro ao processar' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
