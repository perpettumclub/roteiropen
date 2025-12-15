-- =====================================================
-- ROTEIROPEN - SUPABASE SQL SCHEMA
-- Complete database structure with RLS policies
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Creator type based on quiz answers
CREATE TYPE creator_type AS ENUM (
    'relampago',      -- Fast producer
    'perfeccionista', -- Quality focused
    'estrategista',   -- Strategic planner
    'viral'           -- Trend hunter
);

-- User subscription tier
CREATE TYPE subscription_tier AS ENUM (
    'free',
    'premium',
    'enterprise'
);

-- Script platform target
CREATE TYPE platform_type AS ENUM (
    'instagram',
    'tiktok',
    'youtube',
    'linkedin',
    'todas'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Quiz/Creator Profile
    has_completed_quiz BOOLEAN DEFAULT false,
    niche TEXT,
    followers TEXT,
    challenge TEXT,
    frequency TEXT,
    experience TEXT,
    goal TEXT,
    style TEXT,
    platform platform_type,
    creator_type creator_type,
    
    -- Subscription
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Usage limits
    free_scripts_remaining INTEGER DEFAULT 3,
    total_scripts_created INTEGER DEFAULT 0,
    
    -- Activity
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

-- Scripts library
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Script content
    hook TEXT NOT NULL,
    body TEXT[] NOT NULL,
    cta TEXT NOT NULL,
    
    -- Metadata
    duration TEXT,
    tone TEXT,
    platform TEXT,
    niche TEXT,
    
    -- YouTube remix sources (optional)
    youtube_sources JSONB DEFAULT '[]',
    -- Format: [{"url": "...", "title": "...", "author": "..."}]
    
    -- User interaction
    is_favorite BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges/achievements
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL, -- e.g., 'first_script', 'streak_7', etc.
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

-- Activity log (for heatmap)
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    scripts_created INTEGER DEFAULT 0,
    
    UNIQUE(user_id, activity_date)
);

-- Weekly challenges
CREATE TABLE weekly_challenges (
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

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_scripts_user_id ON scripts(user_id);
CREATE INDEX idx_scripts_created_at ON scripts(created_at DESC);
CREATE INDEX idx_scripts_favorite ON scripts(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_activity_log_user_date ON activity_log(user_id, activity_date);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate and update streak
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
        -- Already active today, no change
        RETURN;
    ELSIF v_last_active = v_yesterday THEN
        -- Consecutive day, increment streak
        v_current_streak := v_current_streak + 1;
    ELSIF v_last_active IS NULL THEN
        -- First activity
        v_current_streak := 1;
    ELSE
        -- Streak broken, reset to 1
        v_current_streak := 1;
    END IF;
    
    -- Update longest if current exceeds it
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

-- Increment activity log for today
CREATE OR REPLACE FUNCTION log_script_created(p_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO activity_log (user_id, activity_date, scripts_created)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, activity_date) 
    DO UPDATE SET scripts_created = activity_log.scripts_created + 1;
    
    -- Also update profile counters
    UPDATE profiles 
    SET total_scripts_created = total_scripts_created + 1,
        scripts_this_week = scripts_this_week + 1,
        free_scripts_remaining = GREATEST(0, free_scripts_remaining - 1)
    WHERE id = p_user_id AND subscription_tier = 'free';
    
    -- For premium, just increment total
    UPDATE profiles 
    SET total_scripts_created = total_scripts_created + 1,
        scripts_this_week = scripts_this_week + 1
    WHERE id = p_user_id AND subscription_tier != 'free';
    
    -- Update streak
    PERFORM update_user_streak(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset weekly counters (run via cron)
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
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Auto-log script creation
CREATE OR REPLACE FUNCTION trigger_log_script()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_script_created(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_script_created
    AFTER INSERT ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_script();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Scripts: Users can only access their own scripts
CREATE POLICY "Users can view own scripts" ON scripts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts" ON scripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts" ON scripts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts" ON scripts
    FOR DELETE USING (auth.uid() = user_id);

-- Badges: Users can only view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity Log: Users can only view their own activity
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Challenges: Users can only view/manage their own challenges
CREATE POLICY "Users can view own challenges" ON weekly_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenges" ON weekly_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- User stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.total_scripts_created,
    p.current_streak,
    p.longest_streak,
    p.scripts_this_week,
    p.weekly_goal,
    COUNT(DISTINCT ub.badge_id) as badges_count,
    COUNT(DISTINCT s.id) as library_size,
    COUNT(DISTINCT CASE WHEN s.is_favorite THEN s.id END) as favorites_count
FROM profiles p
LEFT JOIN user_badges ub ON p.id = ub.user_id
LEFT JOIN scripts s ON p.id = s.user_id
GROUP BY p.id;

-- =====================================================
-- SEED DATA: Badge definitions (reference only)
-- =====================================================

/*
Badge IDs and their meaning:
- first_quiz: Completed onboarding quiz
- first_script: Created first script
- first_share: First share
- streak_7: 7 day streak
- streak_30: 30 day streak
- streak_100: 100 day streak
- scripts_10: 10 scripts created
- scripts_50: 50 scripts created
- scripts_100: 100 scripts created
- shared_10: Shared 10 scripts
- premium_member: Premium subscriber
- niche_fitness: 10 fitness scripts
- niche_business: 10 business scripts
- niche_humor: 10 humor scripts
- weekly_goal_1: First weekly goal achieved
- weekly_goal_4: 4 weeks of goals achieved
- night_owl: Created after midnight
- early_bird: Created before 6am
- weekend_warrior: Created on weekend
- challenge_complete: Completed a challenge
- challenge_master: Completed 5 challenges
*/
