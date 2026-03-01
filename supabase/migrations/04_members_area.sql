-- Migration: Members Area Schema
-- Execute no Supabase SQL Editor

-- =====================================================
-- 1. TABELA DE PERFIS (com tier)
-- =====================================================
-- Esta tabela já pode existir, então usamos ALTER TABLE

-- Adicionar coluna tier se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'tier') THEN
        ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'hooky_ai';
    END IF;
END $$;

-- Constraint para valores válidos de tier
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_tier;
ALTER TABLE profiles ADD CONSTRAINT valid_tier 
    CHECK (tier IN ('hooky_ai', 'desafio_45'));

-- =====================================================
-- 2. TABELA DE MÓDULOS
-- =====================================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    duration TEXT,
    module_order INTEGER NOT NULL,
    category TEXT DEFAULT 'Geral',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para módulos (somente leitura para autenticados com tier desafio_45)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules visible to desafio_45 users" ON modules;
CREATE POLICY "Modules visible to desafio_45 users" ON modules
    FOR SELECT
    USING (
        is_published = true 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tier = 'desafio_45'
        )
    );

-- =====================================================
-- 3. TABELA DE PROGRESSO DO USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- RLS para progresso
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 4. TABELA DE POSTS DA COMUNIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts visible to desafio_45 users" ON community_posts;
CREATE POLICY "Posts visible to desafio_45 users" ON community_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tier = 'desafio_45'
        )
    );

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tier = 'desafio_45'
        )
    );

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts" ON community_posts
    FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- 5. TABELA DE COMENTÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para comentários
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments visible to desafio_45 users" ON community_comments;
CREATE POLICY "Comments visible to desafio_45 users" ON community_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tier = 'desafio_45'
        )
    );

DROP POLICY IF EXISTS "Users can create comments" ON community_comments;
CREATE POLICY "Users can create comments" ON community_comments
    FOR INSERT WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tier = 'desafio_45'
        )
    );

-- =====================================================
-- 6. TABELA DE LIKES
-- =====================================================
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- RLS para likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes visible to all" ON post_likes;
CREATE POLICY "Likes visible to all" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can toggle own likes" ON post_likes;
CREATE POLICY "Users can toggle own likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 7. SEED: 8 MÓDULOS INICIAIS (Desafio 45 Dias)
-- =====================================================
INSERT INTO modules (title, description, video_url, duration, module_order, category) VALUES
('Módulo 1: O Mindset do Criador', 'Descubra por que você tem medo de aparecer e como superar isso.', 'https://vimeo.com/SEU_VIDEO_1', '15 min', 1, 'Fundamentos'),
('Módulo 2: A Estrutura Viral', 'O framework de 6 atos para roteiros que prendem atenção.', 'https://vimeo.com/SEU_VIDEO_2', '20 min', 2, 'Fundamentos'),
('Módulo 3: Hooks que Funcionam', 'Biblioteca de ganchos testados + como criar os seus.', 'https://vimeo.com/SEU_VIDEO_3', '18 min', 3, 'Técnica'),
('Módulo 4: A IA Como Parceira', 'Como usar a Hooky AI para acelerar sua produção 10x.', 'https://vimeo.com/SEU_VIDEO_4', '25 min', 4, 'Ferramentas'),
('Módulo 5: Edição Mínima Viável', 'Menos é mais: como editar vídeos que performam.', 'https://vimeo.com/SEU_VIDEO_5', '22 min', 5, 'Técnica'),
('Módulo 6: Postando Sem Medo', 'Exercícios práticos para vencer a vergonha.', 'https://vimeo.com/SEU_VIDEO_6', '15 min', 6, 'Prática'),
('Módulo 7: Analisando Resultados', 'Métricas que importam e como iterar.', 'https://vimeo.com/SEU_VIDEO_7', '18 min', 7, 'Análise'),
('Módulo 8: Próximos Passos', 'O que fazer depois do desafio para manter o momentum.', 'https://vimeo.com/SEU_VIDEO_8', '12 min', 8, 'Conclusão')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. FUNÇÃO PARA ATUALIZAR CONTADORES
-- =====================================================
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'community_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS on_like_change ON post_likes;
CREATE TRIGGER on_like_change
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS on_comment_change ON community_comments;
CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();
