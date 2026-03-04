import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const isLocal = (req) => {
    const host = req.headers.host || '';
    return host.includes('localhost') || host.includes('127.0.0.1');
};

const getSupabase = () => {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

// POST /api/admin/magic-link
router.post('/magic-link', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const supabase = getSupabase();
    const resendKey = process.env.RESEND_API_KEY;

    try {
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: 'https://hookyai.com.br' }
        });
        if (linkError) throw linkError;

        const magicLink = linkData?.properties?.action_link;
        if (!magicLink) throw new Error('Magic link não gerado');

        const userId = linkData?.user?.id;
        if (userId) {
            await supabase.from('profiles').upsert({ id: userId, tier: 'hooky_pro' }, { onConflict: 'id' });
            const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', userId).maybeSingle();
            if (!existingSub) {
                await supabase.from('subscriptions').insert({
                    user_id: userId, status: 'active', plan_name: 'anual', plan_price: 0.00,
                    started_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        }

        if (resendKey) {
            const userName = name || email.split('@')[0];
            const emailHtml = `<!DOCTYPE html><html><head><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f9f9f9;margin:0;padding:40px 0}.container{max-width:440px;margin:0 auto;background:#fff;border-radius:20px;padding:48px;border:1px solid #eee}.button{display:inline-block;background:#FF6B6B;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px}</style></head><body><div class="container"><div style="display:flex;align-items:center;gap:8px;margin-bottom:32px"><img src="https://hookyai.com.br/logo3hooky.png" width="40" height="40" alt="Hooky" style="margin-right:12px"><span style="font-size:24px;font-weight:700;color:#111">Hooky</span></div><h1 style="font-size:22px;font-weight:600;color:#333;margin-bottom:24px">Acesso liberado para você! 🎉</h1><p style="font-size:15px;line-height:22px;color:#333;margin-bottom:24px">Olá, ${userName}!<br><br>Você foi convidado para testar o Hooky. Clique no botão abaixo para entrar direto — sem criar conta ou senha.</p><div style="text-align:center;margin-bottom:24px"><a href="${magicLink}" class="button">Acessar o Hooky agora →</a></div><p style="font-size:14px;color:#666">Este link expira em 1 hora. Se precisar de ajuda, responda este email.</p></div></body></html>`;
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: 'Hooky <noreply@hookyai.com.br>', to: email, subject: '🎉 Seu acesso ao Hooky está pronto!', html: emailHtml }),
            });
        }

        res.json({ success: true, magicLink });
    } catch (err) {
        console.error('magic-link error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/affiliate — criar afiliado
router.post('/affiliate', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const { name, email, commission_percent = 20 } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email obrigatórios' });

    const supabase = getSupabase();

    try {
        // Gerar código único baseado no nome
        const code = name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 10)
            + Math.random().toString(36).slice(2, 5).toUpperCase();

        const affiliateLink = `https://hookyai.com.br/?ref=${code}`;

        const { data, error } = await supabase
            .from('affiliates')
            .insert({ name, email, code, commission_percent })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, affiliate: { ...data, link: affiliateLink } });
    } catch (err) {
        console.error('affiliate error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/affiliates — listar todos
router.get('/affiliates', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const supabase = getSupabase();
    try {
        const { data, error } = await supabase
            .from('affiliates')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ affiliates: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/affiliate/:id — editar comissão
router.patch('/affiliate/:id', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const { commission_percent, is_active } = req.body;
    const supabase = getSupabase();

    try {
        const updates = {};
        if (commission_percent !== undefined) updates.commission_percent = commission_percent;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from('affiliates')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, affiliate: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
