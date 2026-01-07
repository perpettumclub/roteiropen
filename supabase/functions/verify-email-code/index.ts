// supabase/functions/verify-email-code/index.ts
// Edge Function para validar código de verificação

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
        const { email, code } = await req.json()

        if (!email || !code) {
            return new Response(
                JSON.stringify({ error: 'Email e código são obrigatórios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Supabase client with service role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Find the verification code
        const { data: verificationData, error: fetchError } = await supabase
            .from('email_verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .is('verified_at', null)
            .single()

        if (fetchError || !verificationData) {
            return new Response(
                JSON.stringify({ error: 'Código inválido' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if code is expired
        const expiresAt = new Date(verificationData.expires_at)
        if (expiresAt < new Date()) {
            return new Response(
                JSON.stringify({ error: 'Código expirado. Solicite um novo.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Mark code as verified
        await supabase
            .from('email_verification_codes')
            .update({ verified_at: new Date().toISOString() })
            .eq('id', verificationData.id)

        // Update user's email_confirmed_at in auth.users (requires service role)
        // Find user by email and update
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

        if (!userError && userData) {
            const user = userData.users.find(u => u.email === email)
            if (user) {
                await supabase.auth.admin.updateUserById(user.id, {
                    email_confirm: true,
                })
            }
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Email verificado com sucesso!' }),
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
