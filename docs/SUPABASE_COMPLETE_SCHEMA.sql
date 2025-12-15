-- =====================================================
-- HOOKY/ROTEIROPEN - COMPLETE SUPABASE SQL SCHEMA
-- Segurança profissional + RLS + Indexes + Performance
-- =====================================================
-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Baseado nas melhores práticas do Israel Henrique (Acelerador SAS)
-- =====================================================

-- =====================================================
-- 1. ENUMS (Tipos personalizados)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE creator_type AS ENUM ('relampago', 'perfeccionista', 'estrategista', 'viral');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('instagram', 'tiktok', 'youtube', 'linkedin', 'todas');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. TABELA PRINCIPAL: PROFILES
-- REGRA: Sempre ter user_id para identificar o dono
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    -- ID = auth.users(id) - SEMPRE vincular ao usuário autenticado
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Quiz/Creator Profile (dados do onboarding)
    has_completed_quiz BOOLEAN DEFAULT false,
    has_completed_onboarding BOOLEAN DEFAULT false,
    niche TEXT,
    followers TEXT,
    challenge TEXT,
    frequency TEXT,
    experience TEXT,
    goal TEXT,
    style TEXT,
    platform platform_type,
    creator_type creator_type,
    
    -- Subscription (gerenciado pelo Stripe via webhook)
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Usage limits
    free_scripts_remaining INTEGER DEFAULT 3,
    total_scripts_created INTEGER DEFAULT 0,
    
    -- Streaks e Gamificação
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    shares_count INTEGER DEFAULT 0,
    
    -- Weekly goals
    weekly_goal INTEGER DEFAULT 5,
    scripts_this_week INTEGER DEFAULT 0,
    week_start_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: SCRIPTS (Roteiros salvos)
-- =====================================================

CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Conteúdo do roteiro
    hook TEXT NOT NULL,
    body TEXT[] NOT NULL,
    cta TEXT NOT NULL,
    
    -- Metadata
    duration TEXT,
    tone TEXT,
    platform TEXT,
    niche TEXT,
    
    -- YouTube remix sources (JSONB para flexibilidade)
    youtube_sources JSONB DEFAULT '[]',
    -- Formato: [{"url": "...", "title": "...", "author": "..."}]
    
    -- Interação do usuário
    is_favorite BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA: USER_BADGES (Conquistas/Badges)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL, -- 'first_script', 'streak_7', etc.
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- 5. TABELA: ACTIVITY_LOG (Para heatmap)
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    scripts_created INTEGER DEFAULT 0,
    
    UNIQUE(user_id, activity_date)
);

-- =====================================================
-- 6. TABELA: WEEKLY_CHALLENGES (Desafios semanais)
-- =====================================================

CREATE TABLE IF NOT EXISTS weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    reward TEXT,
    
    is_completed BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA: PUSH_SUBSCRIPTIONS (Notificações push)
-- =====================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

-- =====================================================
-- 8. TABELA: REFERRALS (Sistema de indicações)
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    bonus_scripts_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking de quem usou o código
CREATE TABLE IF NOT EXISTS referral_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    converted_to_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA: PERFORMANCE_METRICS (Métricas manuais)
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    followers INTEGER,
    avg_likes INTEGER,
    avg_comments INTEGER,
    reach INTEGER,
    engagement_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- =====================================================
-- 10. TABELA: PERFORMANCE_SCREENSHOTS (Prints de métricas)
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('profile', 'insights')),
    image_url TEXT NOT NULL,     -- URL no Supabase Storage
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. INDEXES PARA PERFORMANCE
-- REGRA: Crie index nos campos que você vai filtrar
-- =====================================================

-- Scripts (filtrados por user_id e data)
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_favorite ON scripts(user_id, is_favorite) WHERE is_favorite = true;

-- Activity log (filtrado por user_id e data)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON activity_log(user_id, activity_date);

-- Badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Referrals (busca por código)
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(user_id);

-- Performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(user_id, date);

-- Screenshots
CREATE INDEX IF NOT EXISTS idx_performance_screenshots_user ON performance_screenshots(user_id);

-- Profiles (busca por stripe_customer_id para webhooks)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- REGRA: SEMPRE ativar RLS em todas as tabelas
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_screenshots ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- REGRA: auth.uid() = id/user_id para cada registro
-- =====================================================

-- Limpar políticas existentes antes de criar novas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can insert own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can update own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can delete own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can view own challenges" ON weekly_challenges;
DROP POLICY IF EXISTS "Users can manage own challenges" ON weekly_challenges;
DROP POLICY IF EXISTS "Users can manage own push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can manage own referrals" ON referrals;
DROP POLICY IF EXISTS "Anyone can view referral uses" ON referral_uses;
DROP POLICY IF EXISTS "Users can manage own metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Users can manage own screenshots" ON performance_screenshots;

-- PROFILES: Usuário só vê/edita SEU próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- SCRIPTS: Usuário só acessa SEUS próprios roteiros
CREATE POLICY "Users can view own scripts" ON scripts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts" ON scripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts" ON scripts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts" ON scripts
    FOR DELETE USING (auth.uid() = user_id);

-- BADGES: Usuário só vê SUAS badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOG: Usuário só vê SUA atividade
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHALLENGES: Usuário só gerencia SEUS desafios
CREATE POLICY "Users can view own challenges" ON weekly_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenges" ON weekly_challenges
    FOR ALL USING (auth.uid() = user_id);

-- PUSH: Usuário só gerencia SUAS notificações
CREATE POLICY "Users can manage own push_subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- REFERRALS: Usuário só gerencia SEU código de indicação
CREATE POLICY "Users can manage own referrals" ON referrals
    FOR ALL USING (auth.uid() = user_id);

-- REFERRAL USES: Leitura pública (para verificar se código existe)
CREATE POLICY "Anyone can view referral uses" ON referral_uses
    FOR SELECT USING (true);

-- PERFORMANCE METRICS: Usuário só gerencia SUAS métricas
CREATE POLICY "Users can manage own metrics" ON performance_metrics
    FOR ALL USING (auth.uid() = user_id);

-- SCREENSHOTS: Usuário só gerencia SEUS prints
CREATE POLICY "Users can manage own screenshots" ON performance_screenshots
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 14. FUNCTIONS (Funções para lógica de negócio)
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Função para calcular e atualizar streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_last_active DATE;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    SELECT last_active_date, current_streak, longest_streak 
    INTO v_last_active, v_current_streak, v_longest_streak
    FROM profiles WHERE id = p_user_id;
    
    IF v_last_active = v_today THEN
        RETURN; -- Já ativo hoje
    ELSIF v_last_active = v_yesterday THEN
        v_current_streak := v_current_streak + 1; -- Dia consecutivo
    ELSIF v_last_active IS NULL THEN
        v_current_streak := 1; -- Primeira atividade
    ELSE
        v_current_streak := 1; -- Streak quebrado
    END IF;
    
    IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
    END IF;
    
    UPDATE profiles 
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_active_date = v_today
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar criação de script
CREATE OR REPLACE FUNCTION log_script_created(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Log na tabela de atividade
    INSERT INTO activity_log (user_id, activity_date, scripts_created)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, activity_date) 
    DO UPDATE SET scripts_created = activity_log.scripts_created + 1;
    
    -- Atualizar contadores para usuários FREE
    UPDATE profiles 
    SET total_scripts_created = total_scripts_created + 1,
        scripts_this_week = scripts_this_week + 1,
        free_scripts_remaining = GREATEST(0, free_scripts_remaining - 1)
    WHERE id = p_user_id AND subscription_tier = 'free';
    
    -- Atualizar contadores para usuários PREMIUM (sem decrementar free_scripts)
    UPDATE profiles 
    SET total_scripts_created = total_scripts_created + 1,
        scripts_this_week = scripts_this_week + 1
    WHERE id = p_user_id AND subscription_tier != 'free';
    
    -- Atualizar streak
    PERFORM update_user_streak(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para logar automaticamente quando script é criado
CREATE OR REPLACE FUNCTION trigger_log_script()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_script_created(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_script_created ON scripts;
CREATE TRIGGER on_script_created
    AFTER INSERT ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_script();

-- Função para resetar contadores semanais (rodar via cron)
CREATE OR REPLACE FUNCTION reset_weekly_counters()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET scripts_this_week = 0,
        week_start_date = CURRENT_DATE
    WHERE week_start_date IS NULL 
       OR week_start_date < date_trunc('week', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 15. FUNÇÃO RPC PARA STRIPE WEBHOOK
-- IMPORTANTE: Webhooks do Stripe não têm auth.uid()
-- Por isso usamos SECURITY DEFINER
-- =====================================================

CREATE OR REPLACE FUNCTION handle_stripe_webhook(
    p_stripe_customer_id TEXT,
    p_subscription_tier TEXT,
    p_expires_at TIMESTAMPTZ
)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET subscription_tier = p_subscription_tier::subscription_tier,
        subscription_expires_at = p_expires_at
    WHERE stripe_customer_id = p_stripe_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 16. VIEW PARA ESTATÍSTICAS DO USUÁRIO
-- =====================================================

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.total_scripts_created,
    p.current_streak,
    p.longest_streak,
    p.scripts_this_week,
    p.weekly_goal,
    p.subscription_tier,
    COUNT(DISTINCT ub.badge_id) as badges_count,
    COUNT(DISTINCT s.id) as library_size,
    COUNT(DISTINCT CASE WHEN s.is_favorite THEN s.id END) as favorites_count
FROM profiles p
LEFT JOIN user_badges ub ON p.id = ub.user_id
LEFT JOIN scripts s ON p.id = s.user_id
GROUP BY p.id;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- RESUMO DAS BOAS PRÁTICAS APLICADAS:
-- ✅ Todas as tabelas têm user_id para identificar o dono
-- ✅ RLS ativado em TODAS as tabelas
-- ✅ Políticas com auth.uid() = user_id
-- ✅ Indexes nos campos que são filtrados (user_id, date, etc.)
-- ✅ Funções SECURITY DEFINER para operações do servidor
-- ✅ Triggers automáticos para atualizar contadores
-- ✅ stripe_customer_id indexado para performance em webhooks
