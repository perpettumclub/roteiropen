// Edge Function: send-progress-email
// Purpose: Send progress-related emails and log them to email_logs table
// Supports: upload_confirmation, goal_proximity, goal_achieved, reengagement_7d/15d/30d

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates based on type
const EMAIL_TEMPLATES = {
    upload_confirmation: (data: any) => ({
        subject: '✅ Progresso registrado no Hooky!',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; font-size: 28px; margin: 0;">🎉 Progresso Registrado!</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; color: white; margin-bottom: 24px;">
                <p style="margin: 0 0 16px; font-size: 16px;">Seus números de hoje:</p>
                <div style="display: flex; justify-content: space-around; text-align: center;">
                    <div>
                        <div style="font-size: 32px; font-weight: 700;">${data.seguidores?.toLocaleString('pt-BR') || '—'}</div>
                        <div style="font-size: 14px; opacity: 0.9;">Seguidores</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700;">${data.engajamento || '—'}%</div>
                        <div style="font-size: 14px; opacity: 0.9;">Engajamento</div>
                    </div>
                </div>
            </div>
            
            ${data.meta ? `
            <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #666;">Progresso para sua meta de <strong>${(data.meta / 1000).toFixed(1)}k</strong>:</p>
                <div style="background: #e0e0e0; border-radius: 8px; height: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${Math.min(data.percentMeta || 0, 100)}%; transition: width 0.5s;"></div>
                </div>
                <p style="margin: 8px 0 0; font-size: 14px; color: #888;">${data.percentMeta || 0}% • Faltam ${data.faltam?.toLocaleString('pt-BR') || 0} seguidores</p>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Continue assim! A consistência é o segredo do crescimento. 
                Seu próximo registro deve ser em <strong>7 dias</strong>.
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Ver Dashboard Completo
                </a>
            </div>
            
            <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
                Hooky AI • Criando roteiros que viralizam
            </p>
        </div>
        `
    }),

    goal_proximity: (data: any) => ({
        subject: `🔥 Você está a ${data.faltam?.toLocaleString('pt-BR')} seguidores da meta!`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #000; font-size: 28px; margin: 0;">⚡ Você está quase lá!</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px; padding: 24px; color: white; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 16px;">Progresso atual:</p>
                <div style="font-size: 48px; font-weight: 700;">${data.percentMeta || 0}%</div>
                <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Faltam apenas <strong>${data.faltam?.toLocaleString('pt-BR')}</strong> seguidores!</p>
            </div>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Você está a <strong>${100 - (data.percentMeta || 0)}%</strong> de bater sua meta de <strong>${(data.meta / 1000).toFixed(1)}k</strong> seguidores!
            </p>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Continue criando conteúdo consistente e você vai chegar lá em breve. 🚀
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Registrar Novo Progresso
                </a>
            </div>
        </div>
        `
    }),

    goal_achieved: (data: any) => ({
        subject: '🏆 PARABÉNS! Você bateu sua meta!',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 72px;">🏆</div>
                <h1 style="color: #000; font-size: 32px; margin: 16px 0 0;">VOCÊ CONSEGUIU!</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 16px;">Meta alcançada:</p>
                <div style="font-size: 56px; font-weight: 700;">${(data.meta / 1000).toFixed(1)}K</div>
                <p style="margin: 8px 0 0; font-size: 16px;">seguidores</p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                Você provou que com <strong>consistência e bons roteiros</strong>, o crescimento é inevitável.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    💡 <strong>Próximo passo:</strong> Defina uma nova meta ainda mais ambiciosa!
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Definir Nova Meta
                </a>
            </div>
        </div>
        `
    }),

    reengagement_7d: (_data: any) => ({
        subject: '👋 Sentimos sua falta! Hora de atualizar seu progresso',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 24px; margin: 0 0 16px;">Faz 1 semana desde seu último registro</h1>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                A consistência é o que separa quem cresce de quem fica parado.
            </p>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Tire 30 segundos agora para registrar seus números atuais. Você vai agradecer depois ao ver seu gráfico de evolução!
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Registrar Progresso Agora
                </a>
            </div>
        </div>
        `
    }),

    reengagement_15d: (_data: any) => ({
        subject: '⏰ 15 dias sem registro - não perca seu histórico!',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 24px; margin: 0 0 16px;">Seu crescimento merece ser registrado</h1>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Já se passaram 15 dias desde seu último registro de progresso no Hooky.
            </p>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Mesmo que você não tenha crescido muito, registrar é importante para entender seus padrões e melhorar sua estratégia.
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Voltar ao Dashboard
                </a>
            </div>
        </div>
        `
    }),

    reengagement_30d: (_data: any) => ({
        subject: '🔴 1 mês sem registro - precisamos conversar',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 24px; margin: 0 0 16px;">Olá, está tudo bem?</h1>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Já faz 1 mês desde sua última visita ao dashboard de progresso.
            </p>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Entendemos que a vida é corrida, mas seu crescimento no Instagram não precisa parar.
            </p>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Que tal recomeçar hoje? Mesmo um pequeno registro já é um passo na direção certa.
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://app.hooky.com/dashboard/progress" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
                    Recomeçar Agora
                </a>
            </div>
        </div>
        `
    }),
}

type EmailType = keyof typeof EMAIL_TEMPLATES

interface EmailRequest {
    user_id: string
    email_type: EmailType
    user_email?: string // Optional: if already known
    metadata?: Record<string, any>
}

async function checkAlreadySent(userId: string, emailType: string, hoursAgo: number = 24): Promise<boolean> {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('email_type', emailType)
        .gte('sent_at', since)
        .limit(1)

    if (error) {
        console.error('Error checking email_logs:', error)
        return false
    }

    return (data?.length || 0) > 0
}

async function logEmail(userId: string, emailType: string, metadata: Record<string, any> = {}) {
    const { error } = await supabase
        .from('email_logs')
        .insert({
            user_id: userId,
            email_type: emailType,
            metadata
        })

    if (error) {
        console.error('Error logging email:', error)
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY not configured')
        }

        const body: EmailRequest = await req.json()
        const { user_id, email_type, metadata = {} } = body
        let { user_email } = body

        if (!user_id || !email_type) {
            throw new Error('user_id and email_type are required')
        }

        // Validate email type
        if (!EMAIL_TEMPLATES[email_type]) {
            throw new Error(`Invalid email_type: ${email_type}`)
        }

        // Check if already sent recently (prevent spam)
        const cooldownHours = email_type.startsWith('reengagement') ? 168 : 24 // 7 days for reengagement, 24h for others
        const alreadySent = await checkAlreadySent(user_id, email_type, cooldownHours)

        if (alreadySent) {
            console.log(`Email ${email_type} already sent to user ${user_id} within cooldown period`)
            return new Response(JSON.stringify({
                success: false,
                reason: 'already_sent_recently'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Get user email if not provided
        if (!user_email) {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id)
            if (userError || !user?.email) {
                throw new Error(`Could not fetch user email: ${userError?.message}`)
            }
            user_email = user.email
        }

        // Generate email content
        const template = EMAIL_TEMPLATES[email_type](metadata)

        // Send via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Hooky <onboarding@resend.dev>', // TODO: Update with verified domain
                to: user_email,
                subject: template.subject,
                html: template.html,
            }),
        })

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json()
            console.error('Resend error:', errorData)
            throw new Error(`Resend error: ${JSON.stringify(errorData)}`)
        }

        const emailResult = await emailResponse.json()
        console.log(`Email ${email_type} sent to ${user_email}:`, emailResult)

        // Log the sent email
        await logEmail(user_id, email_type, metadata)

        return new Response(JSON.stringify({
            success: true,
            email_id: emailResult.id,
            email_type,
            sent_to: user_email
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Error sending email:', error)
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
