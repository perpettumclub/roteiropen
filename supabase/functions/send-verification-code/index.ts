// supabase/functions/send-verification-code/index.ts
// Edge Function para enviar código de verificação de email

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

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Hooky <noreply@hooky.ai>',
                to: email,
                subject: 'Seu código de verificação - Hooky',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1f1f1f; font-size: 24px;">🔐 Hooky</h1>
            </div>
            <p style="color: #666; font-size: 16px;">Olá!</p>
            <p style="color: #666; font-size: 16px;">Seu código de verificação é:</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f1f1f;">${code}</span>
            </div>
            <p style="color: #999; font-size: 14px;">Este código expira em 10 minutos.</p>
            <p style="color: #999; font-size: 14px;">Se você não solicitou este código, ignore este email.</p>
          </div>
        `,
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
