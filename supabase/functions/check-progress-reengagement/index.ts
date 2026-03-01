// Edge Function: check-progress-reengagement
// Purpose: Check for inactive users and send re-engagement emails
// Run as cron: e.g., daily at 10:00 AM UTC
// Trigger: supabase schedule (add to supabase/config.toml)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }

    const results: any[] = []
    const now = new Date()

    try {
        // 1. Find all users with at least one metric entry
        const { data: users, error: usersError } = await supabase
            .from('social_metrics')
            .select('user_id, date')
            .order('date', { ascending: false })

        if (usersError) throw usersError

        // Group by user to get their last activity date
        const userLastActivity = new Map<string, Date>()
        for (const entry of users || []) {
            if (!userLastActivity.has(entry.user_id)) {
                userLastActivity.set(entry.user_id, new Date(entry.date))
            }
        }

        console.log(`Found ${userLastActivity.size} users with progress data`)

        for (const [userId, lastDate] of userLastActivity) {
            const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

            // Determine if we should send a re-engagement email
            let emailType: string | null = null

            if (daysSince >= 30) {
                emailType = 'reengagement_30d'
            } else if (daysSince >= 15) {
                emailType = 'reengagement_15d'
            } else if (daysSince >= 7) {
                emailType = 'reengagement_7d'
            }

            if (!emailType) continue

            // Check if already sent this email type recently (7 days for re-engagement)
            const { data: recentEmail } = await supabase
                .from('email_logs')
                .select('id')
                .eq('user_id', userId)
                .eq('email_type', emailType)
                .gte('sent_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .limit(1)

            if (recentEmail && recentEmail.length > 0) {
                console.log(`Skipping ${emailType} for ${userId} - already sent recently`)
                continue
            }

            // Call send-progress-email function
            const { data, error } = await supabase.functions.invoke('send-progress-email', {
                body: {
                    user_id: userId,
                    email_type: emailType,
                    metadata: { days_inactive: daysSince }
                }
            })

            if (error) {
                console.error(`Failed to send ${emailType} to ${userId}:`, error)
                results.push({ user_id: userId, email_type: emailType, status: 'failed', error: error.message })
            } else {
                console.log(`Sent ${emailType} to ${userId}:`, data)
                results.push({ user_id: userId, email_type: emailType, status: 'sent' })
            }
        }

        return new Response(JSON.stringify({
            success: true,
            processed: userLastActivity.size,
            emails_sent: results.filter(r => r.status === 'sent').length,
            results
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Re-engagement check failed:', error)
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
