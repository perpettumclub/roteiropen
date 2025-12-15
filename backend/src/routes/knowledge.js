import express from 'express';
import { supabase } from '../services/supabase.js';
import { generateEmbedding } from '../services/openai.js';

const router = express.Router();

// POST /api/knowledge/add - Add item to knowledge base
router.post('/add', async (req, res, next) => {
    try {
        const { userId, content, type, metadata } = req.body;

        if (!content || !type) {
            return res.status(400).json({ error: 'Content and type are required' });
        }

        // Generate embedding for semantic search
        const embedding = await generateEmbedding(content);

        const { data, error } = await supabase
            .from('knowledge_base')
            .insert({
                user_id: userId,
                content,
                type, // 'script', 'reference', 'note', 'youtube'
                metadata,
                embedding
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, item: data });
    } catch (error) {
        next(error);
    }
});

// POST /api/knowledge/search - Semantic search in knowledge base
router.post('/search', async (req, res, next) => {
    try {
        const { userId, query, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Semantic search using pgvector
        const { data, error } = await supabase.rpc('match_knowledge', {
            query_embedding: queryEmbedding,
            match_threshold: 0.7,
            match_count: limit,
            p_user_id: userId
        });

        if (error) throw error;

        res.json({ success: true, results: data });
    } catch (error) {
        next(error);
    }
});

// GET /api/knowledge/list - List all knowledge items for user
router.get('/list', async (req, res, next) => {
    try {
        const { userId, type, limit = 50 } = req.query;

        let query = supabase
            .from('knowledge_base')
            .select('id, content, type, metadata, created_at')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (userId) {
            query = query.eq('user_id', userId);
        }
        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, items: data });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/knowledge/:id - Delete knowledge item
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('knowledge_base')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
