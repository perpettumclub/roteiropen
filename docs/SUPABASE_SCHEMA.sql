-- =============================================================================
-- ROTEIROPEN / HOOKY - SUPABASE SCHEMA
-- Generated: 2026-01-01
-- Includes: Auth (OAuth/Email), User Profiles, Scripts, Gamification, Progress
-- =============================================================================

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USER PROFILES (extends Supabase Auth)
-- =============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    
    -- Creator Profile (from Quiz)
    niche TEXT, -- fitness, negocios, lifestyle, humor, educacao, tech
    followers TEXT, -- 0-1k, 1k-10k, 10k-50k, 50k-100k, 100k+
    challenge TEXT, -- ideias, tempo, estrutura, hook, constancia
    frequency TEXT,
    experience TEXT,
    goal TEXT, -- crescer, monetizar, marca, vendas
    style TEXT,
    platform TEXT, -- instagram, tiktok, youtube, linkedin, todas
    time TEXT,
    frustration TEXT, -- bloqueio, engajamento, tempo, algoritmo
    investment TEXT,
    commitment TEXT,
    creator_type TEXT CHECK (creator_type IN ('relampago', 'perfeccionista', 'estrategista', 'viral')),
    
    -- Quiz Completion
    has_completed_quiz BOOLEAN DEFAULT FALSE,
    
    -- Usage & Subscription
    is_premium BOOLEAN DEFAULT FALSE,
    free_scripts_remaining INTEGER DEFAULT 3,
    total_scripts_created INTEGER DEFAULT 0,
    
    -- Streaks & Gamification
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    
    -- Weekly Goals
    weekly_goal INTEGER DEFAULT 5,
    scripts_this_week INTEGER DEFAULT 0,
    week_start_date DATE,
    
    -- Sharing
    shares_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BADGES
-- =============================================================================
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL, -- first_quiz, first_script, streak_7, etc.
    emoji TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    category TEXT CHECK (category IN ('getting_started', 'streaks', 'volume', 'sharing', 'premium', 'niches', 'weekly_goals', 'special', 'challenges'))
);

-- User earned badges (many-to-many)
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL REFERENCES public.badges(key) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);

-- =============================================================================
-- SCRIPTS
-- =============================================================================
CREATE TABLE public.scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Script Content (JSONB for flexibility)
    hooks JSONB NOT NULL, -- Array of {type, text, emoji}
    selected_hook_index INTEGER DEFAULT 0,
    conflito TEXT NOT NULL,
    climax TEXT NOT NULL,
    solucao TEXT NOT NULL,
    cta TEXT NOT NULL,
    
    -- Metadata
    duration TEXT, -- 15s, 30s, 60s
    tone TEXT, -- casual, professional, etc.
    platform TEXT, -- instagram, tiktok, youtube
    niche TEXT,
    
    -- User Actions
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACTIVITY LOG (for heatmap)
-- =============================================================================
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    scripts_created INTEGER DEFAULT 1,
    UNIQUE(user_id, activity_date)
);

-- =============================================================================
-- WEEKLY CHALLENGES
-- =============================================================================
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target INTEGER NOT NULL, -- Number of scripts to create
    reward TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- =============================================================================
-- PROGRESS TRACKING (Screenshots & Metrics)
-- =============================================================================
CREATE TABLE public.progress_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    followers INTEGER,
    avg_likes INTEGER,
    avg_comments INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

CREATE TABLE public.progress_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    screenshot_type TEXT CHECK (screenshot_type IN ('profile', 'insights')),
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    screenshot_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUBSCRIPTIONS / BILLING
-- =============================================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT CHECK (plan IN ('free', 'pro', 'unlimited')) DEFAULT 'free',
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
    
-- Restrict updates to only non-sensitive metadata via RLS
CREATE POLICY "Users can update own profile metadata" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        -- This is a soft check, but PostgreSQL/Supabase RLS doesn't natively block columns easily.
        -- We will use a trigger for robust protection below.
        auth.uid() = id
    );

    
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Badges: Anyone can read badges (public catalog)
CREATE POLICY "Badges are publicly readable" ON public.badges
    FOR SELECT USING (true);

-- User Badges: Users can only see their own badges
CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scripts: Users can only access their own scripts
CREATE POLICY "Users can view own scripts" ON public.scripts
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own scripts" ON public.scripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own scripts" ON public.scripts
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own scripts" ON public.scripts
    FOR DELETE USING (auth.uid() = user_id);

-- Activity Log: Users can only access their own activity
CREATE POLICY "Users can view own activity" ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own activity" ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own activity" ON public.activity_log
    FOR UPDATE USING (auth.uid() = user_id);

-- Challenges: Anyone can read challenges (public catalog)
CREATE POLICY "Challenges are publicly readable" ON public.challenges
    FOR SELECT USING (true);

-- User Challenges: Users can only access their own challenge progress
CREATE POLICY "Users can view own challenges" ON public.user_challenges
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own challenges" ON public.user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own challenges" ON public.user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- Progress Metrics: Users can only access their own metrics
CREATE POLICY "Users can view own metrics" ON public.progress_metrics
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own metrics" ON public.progress_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own metrics" ON public.progress_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Progress Screenshots: Users can only access their own screenshots
CREATE POLICY "Users can view own screenshots" ON public.progress_screenshots
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own screenshots" ON public.progress_screenshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own screenshots" ON public.progress_screenshots
    FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON public.scripts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Protection: Prevent users from updating sensitive columns in profiles
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is not a service_role (system), block changes to restricted columns
    -- In Supabase, we can check the role
    IF current_setting('role') = 'authenticated' THEN
        IF NEW.is_premium IS DISTINCT FROM OLD.is_premium OR
           NEW.free_scripts_remaining IS DISTINCT FROM OLD.free_scripts_remaining OR
           NEW.total_scripts_created IS DISTINCT FROM OLD.total_scripts_created OR
           NEW.current_streak IS DISTINCT FROM OLD.current_streak OR
           NEW.longest_streak IS DISTINCT FROM OLD.longest_streak THEN
            RAISE EXCEPTION 'Não é permitido alterar colunas protegidas diretamente.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_profiles_on_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();


-- =============================================================================
-- SEED DATA: BADGES
-- =============================================================================
INSERT INTO public.badges (key, emoji, title, description, color, category) VALUES
-- Getting Started
('first_quiz', '🎯', 'Primeiro Passo', 'Completou o quiz', '#6366F1', 'getting_started'),
('first_script', '🔥', 'Primeira Chama', 'Criou o primeiro roteiro', '#EF4444', 'getting_started'),
('first_share', '📤', 'Compartilhador', 'Primeiro compartilhamento', '#8B5CF6', 'getting_started'),
-- Streaks
('streak_7', '⚡', 'Consistente', '7 dias seguidos', '#F59E0B', 'streaks'),
('streak_30', '💎', 'Obsessivo', '30 dias seguidos', '#06B6D4', 'streaks'),
('streak_100', '🏆', 'Lenda', '100 dias seguidos', '#FFD700', 'streaks'),
-- Volume
('scripts_10', '📝', 'Produtivo', '10 roteiros criados', '#10B981', 'volume'),
('scripts_50', '🚀', 'Máquina', '50 roteiros criados', '#3B82F6', 'volume'),
('scripts_100', '👑', 'Rei do Conteúdo', '100 roteiros criados', '#EC4899', 'volume'),
-- Sharing
('shared_10', '🌟', 'Influenciador', 'Compartilhou 10 roteiros', '#8B5CF6', 'sharing'),
-- Premium
('premium_member', '💫', 'VIP', 'Membro Premium', '#FFD700', 'premium'),
-- Niches
('niche_fitness', '💪', 'Fitness Creator', '10 roteiros de fitness', '#EF4444', 'niches'),
('niche_business', '💼', 'Business Mind', '10 roteiros de negócios', '#6366F1', 'niches'),
('niche_humor', '😂', 'Comediante', '10 roteiros de humor', '#F59E0B', 'niches'),
-- Weekly Goals
('weekly_goal_1', '✅', 'Meta Batida', 'Cumpriu 1 meta semanal', '#10B981', 'weekly_goals'),
('weekly_goal_4', '📈', 'Mês Perfeito', '4 semanas de metas batidas', '#3B82F6', 'weekly_goals'),
-- Special
('night_owl', '🦉', 'Coruja', 'Criou roteiro após meia-noite', '#6366F1', 'special'),
('early_bird', '🐦', 'Madrugador', 'Criou roteiro antes das 6h', '#F59E0B', 'special'),
('weekend_warrior', '⚔️', 'Guerreiro de Fds', 'Criou no sábado e domingo', '#EC4899', 'special'),
-- Challenges
('challenge_complete', '🎖️', 'Desafiante', 'Completou um desafio', '#8B5CF6', 'challenges'),
('challenge_master', '🏅', 'Mestre', 'Completou 5 desafios', '#FFD700', 'challenges');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_scripts_created_at ON public.scripts(created_at DESC);
CREATE INDEX idx_activity_log_user_date ON public.activity_log(user_id, activity_date);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_progress_metrics_user_date ON public.progress_metrics(user_id, metric_date);


-- =============================================================================
-- ADDITIONAL TABLES (Discovered from deeper analysis)
-- =============================================================================

-- TRANSCRIPTIONS: Store audio transcriptions before script generation
CREATE TABLE public.transcriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Audio info (reference to storage)
    audio_storage_path TEXT, -- Path in Supabase Storage
    audio_duration_seconds INTEGER,
    
    -- Transcription content
    raw_text TEXT NOT NULL,
    extracted_problem TEXT,
    extracted_solution TEXT,
    
    -- Associated script (if generated)
    script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT CHECK (status IN ('transcribed', 'confirmed', 'processed')) DEFAULT 'transcribed',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFERRALS: Track user referrals and rewards
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The user who is referring others
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL, -- e.g., 'RP8X3Z4A'
    
    -- The user who was referred (if they signed up)
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'signed_up', 'converted')) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ
);

-- QUIZ RESPONSES: Store individual quiz answers for analytics
CREATE TABLE public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Quiz answers stored as JSONB for flexibility
    answers JSONB NOT NULL, -- {platform: 'instagram', source: 'tiktok', niche: 'fitness', ...}
    
    -- Calculated results
    creator_type TEXT CHECK (creator_type IN ('relampago', 'perfeccionista', 'estrategista', 'viral')),
    
    -- Timestamps
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Transcriptions policies
CREATE POLICY "Users can view own transcriptions" ON public.transcriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transcriptions" ON public.transcriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transcriptions" ON public.transcriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can insert own referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Quiz responses policies
CREATE POLICY "Users can view own quiz responses" ON public.quiz_responses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz responses" ON public.quiz_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- ADDITIONAL COLUMNS FOR EXISTING TABLES
-- =============================================================================

-- Add source attribution to profiles (from quiz: how did you hear about us?)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS source TEXT; -- instagram, tiktok, youtube, google, amigo

-- Add referral_code to profiles for quick lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add referred_by to profiles (who referred this user)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Add CTA customization to scripts
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS cta_type TEXT; -- comment, follow, dm, sales
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS cta_keyword TEXT DEFAULT 'EU QUERO';

-- Add youtube references used for remix
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS youtube_references JSONB; -- Array of YouTube URLs used

-- =============================================================================
-- TRIGGER: Generate referral code on profile creation
-- =============================================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := 'RP' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- =============================================================================
-- INDEXES FOR NEW TABLES
-- =============================================================================
CREATE INDEX idx_transcriptions_user_id ON public.transcriptions(user_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
