-- =====================================================
-- KNOWLEDGE BASE EXTENSION FOR ROTEIROPEN
-- Requires pgvector extension for semantic search
-- =====================================================

-- Enable pgvector extension (run this first in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table with embeddings
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'script', 'reference', 'note', 'youtube', 'prompt'
    metadata JSONB DEFAULT '{}',
    
    -- Embedding for semantic search (1536 dimensions for text-embedding-3-small)
    embedding vector(1536),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX knowledge_embedding_idx ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering
CREATE INDEX knowledge_user_type_idx ON knowledge_base(user_id, type);

-- RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own knowledge" ON knowledge_base
    FOR ALL USING (auth.uid() = user_id);

-- Allow service role full access (for backend)
CREATE POLICY "Service role full access" ON knowledge_base
    FOR ALL USING (auth.role() = 'service_role');

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    type text,
    metadata jsonb,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        knowledge_base.id,
        knowledge_base.content,
        knowledge_base.type,
        knowledge_base.metadata,
        1 - (knowledge_base.embedding <=> query_embedding) as similarity
    FROM knowledge_base
    WHERE 
        (p_user_id IS NULL OR knowledge_base.user_id = p_user_id)
        AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
    ORDER BY knowledge_base.embedding <=> query_embedding
    LIMIT match_count;
$$;
