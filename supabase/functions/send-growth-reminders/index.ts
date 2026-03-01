import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const resend = new Resend(RESEND_API_KEY)
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Fetch users who want weekly notifications
        const { data: goals, error: goalsError } = await supabase
            .from('user_goals')
            .select('user_id, target_followers, notification_weekly')
            .eq('notification_weekly', true)

        if (goalsError) throw goalsError

        console.log(`Found ${goals.length} users for weekly reminders.`)

        const results = []

        for (const goal of goals) {
            // 2. Fetch User Email (Admin only)
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(goal.user_id)

            if (userError || !user?.email) {
                console.error(`Could not fetch user ${goal.user_id}:`, userError)
                continue
            }

            // 3. Send Email
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Hooky <onboarding@resend.dev>', // TODO: Update with user's verified domain
                to: user.email,
                subject: '🚀 Hora de atualizar seu progresso no Hooky!',
                html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Sua semana no Hooky 💎</h1>
            <p>Olá!</p>
            <p>Mais uma semana se passou. Você está mais perto da sua meta de <strong>${goal.target_followers ? (goal.target_followers / 1000).toFixed(1) + 'k' : 'crescimento'}</strong> seguidores?</p>
            <p>Não esqueça de registrar seu progresso hoje para manter sua consistência! Aproveite para <strong>compartilhar sua evolução nos Stories</strong> e inspirar outros criadores.</p>
            
            <div style="margin: 30px 0;">
                <a href="https://app.hooky.com/dashboard/progress" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Registrar Progresso Agora ➔
                </a>
            </div>

            <p style="color: #666; font-size: 14px;">
                Continue criando scripts virais. O resultado vem com a constância.<br>
                <em>Equipe Hooky</em>
            </p>
          </div>
        `
            })

            if (emailError) {
                console.error(`Failed to email ${user.email}:`, emailError)
                results.push({ user: user.email, status: 'failed', error: emailError })
            } else {
                console.log(`Email sent to ${user.email}`)
                results.push({ user: user.email, status: 'sent', id: emailData?.id })
            }
        }

        return new Response(JSON.stringify(results), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
