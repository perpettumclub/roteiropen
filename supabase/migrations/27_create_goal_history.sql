-- =====================================================
-- HOOKY - HISTÓRICO DE METAS BATIDAS
-- Esta migration cria a tabela goal_history para
-- registrar cada vez que o usuário bate uma meta
-- =====================================================

-- Tabela para armazenar histórico de metas atingidas
CREATE TABLE IF NOT EXISTS goal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados da meta atingida
    target_followers INTEGER NOT NULL,
    achieved_followers INTEGER NOT NULL,
    goal_name VARCHAR(100),
    
    -- Data de início e conclusão
    started_at TIMESTAMPTZ NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Duração em dias
    days_to_achieve INTEGER GENERATED ALWAYS AS (
        EXTRACT(DAY FROM (achieved_at - started_at))::INTEGER
    ) STORED,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_goal_history_user_id ON goal_history(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_history_achieved_at ON goal_history(achieved_at DESC);

-- RLS (Row Level Security)
ALTER TABLE goal_history ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem suas próprias metas
CREATE POLICY "Users can view their own goal history"
    ON goal_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir suas próprias metas
CREATE POLICY "Users can insert their own goal history"
    ON goal_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Comentário na tabela
COMMENT ON TABLE goal_history IS 'Histórico de metas de seguidores atingidas pelo usuário';
