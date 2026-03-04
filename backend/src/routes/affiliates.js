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

// POST /api/affiliates — criar afiliado
router.post('/', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const { name, email, commission_percent = 20 } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email obrigatórios' });

    const supabase = getSupabase();

    try {
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
        console.error('affiliate create error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/affiliates — listar todos
router.get('/', async (req, res) => {
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

// PATCH /api/affiliates/:id — editar comissão / ativar/desativar
router.patch('/:id', async (req, res) => {
    if (!isLocal(req)) return res.status(403).json({ error: 'Acesso negado — apenas local' });

    const { commission_percent, is_active, code } = req.body;
    const supabase = getSupabase();

    try {
        const updates = {};
        if (commission_percent !== undefined) updates.commission_percent = commission_percent;
        if (is_active !== undefined) updates.is_active = is_active;
        if (code !== undefined) updates.code = code;

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
