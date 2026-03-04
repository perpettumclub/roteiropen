import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Só funciona localmente — verificação simples de origem
const isLocal = (req) => {
    const host = req.headers.host || '';
    return host.includes('localhost') || host.includes('127.0.0.1');
};

// POST /api/admin/magic-link
// Body: { email: string, name?: string }
router.post('/magic-link', async (req, res) => {
    if (!isLocal(req)) {
        return res.status(403).json({ error: 'Acesso negado — apenas local' });
    }

    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase não configurado' });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        // 1. Gerar magic link via Admin API
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: 'https://hookyai.com.br'
            }
        });

        if (linkError) throw linkError;

        const magicLink = linkData?.properties?.action_link;
        if (!magicLink) throw new Error('Magic link não gerado');

        // 2. Garantir que o usuário tem subscription ativa
        const userId = linkData?.user?.id;
        if (userId) {
            // Upsert profile com hooky_pro
            await supabase.from('profiles').upsert({
                id: userId,
                tier: 'hooky_pro'
            }, { onConflict: 'id', ignoreDuplicates: false });

            // Inserir subscription se não tiver
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (!existingSub) {
                await supabase.from('subscriptions').insert({
                    user_id: userId,
                    status: 'active',
                    plan_name: 'anual',
                    plan_price: 0.00,
                    started_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        }

        // 3. Enviar email com mesmo template via Resend
        if (resendKey) {
            const userName = name || email.split('@')[0];
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
        <h1 class="title">Acesso liberado para você! 🎉</h1>
        <p class="text">
            Olá, ${userName}!<br><br>
            Você foi convidado para testar o Hooky. Clique no botão abaixo para entrar direto — sem precisar criar conta ou senha.
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
            <a href="${magicLink}" class="button">Acessar o Hooky agora →</a>
        </div>
        <p class="footer-text" style="margin-top: 24px;">
            Este link expira em 1 hora. Se precisar de ajuda, responda este email.
        </p>
        <div class="powered">
            Powered by <span style="font-weight: 700; color: #FF6B6B; margin-left: 2px;">Hooky</span>
        </div>
    </div>
</body>
</html>`;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Hooky <noreply@hookyai.com.br>',
                    to: email,
                    subject: '🎉 Seu acesso ao Hooky está pronto!',
                    html: emailHtml,
                }),
            });
        }

        res.json({
            success: true,
            magicLink,
            message: `Magic link gerado e email enviado para ${email}`
        });

    } catch (err) {
        console.error('Admin magic-link error:', err);
        res.status(500).json({ error: err.message || 'Erro ao gerar magic link' });
    }
});

export default router;
