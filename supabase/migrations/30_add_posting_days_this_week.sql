-- Migration 30: Add posting_days_this_week to count unique days (not total posts)
-- This fixes the weekly progress bar to show X/7 days instead of X/7 posts

-- Add new column to user_goals
ALTER TABLE user_goals
ADD COLUMN IF NOT EXISTS posting_days_this_week INTEGER DEFAULT 0;

-- Update the update_posting_stats function to calculate unique days
CREATE OR REPLACE FUNCTION update_posting_stats(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_current_date DATE;
    v_check_date DATE;
    v_posts_this_week INTEGER := 0;
    v_posting_days_this_week INTEGER := 0;
    v_goal_60_progress INTEGER := 0;
BEGIN
    -- Set timezone to Brazil/Sao_Paulo for consistency
    SET timezone = 'America/Sao_Paulo';
    
    v_current_date := CURRENT_DATE;
    v_check_date := v_current_date;
    
    -- Calculate consecutive posting streak (days with at least 1 post)
    WHILE EXISTS (
        SELECT 1 FROM frequency_scripts
        WHERE user_id = p_user_id
        AND posted_at::date = v_check_date
    ) LOOP
        v_streak := v_streak + 1;
        v_check_date := v_check_date - INTERVAL '1 day';
    END LOOP;
    
    -- Get longest streak from user_goals (if exists)
    SELECT COALESCE(longest_posting_streak, 0) INTO v_longest_streak
    FROM user_goals
    WHERE user_id = p_user_id;
    
    -- Update longest if current is higher
    IF v_streak > v_longest_streak THEN
        v_longest_streak := v_streak;
    END IF;
    
    -- Count total posts this week (for reference, keeping old column)
    SELECT COUNT(*) INTO v_posts_this_week
    FROM frequency_scripts
    WHERE user_id = p_user_id
    AND posted_at >= DATE_TRUNC('week', CURRENT_DATE);
    
    -- Count UNIQUE DAYS with posts this week (NEW LOGIC)
    SELECT COUNT(DISTINCT posted_at::date) INTO v_posting_days_this_week
    FROM frequency_scripts
    WHERE user_id = p_user_id
    AND posted_at >= DATE_TRUNC('week', CURRENT_DATE)
    AND posted_at IS NOT NULL;
    
    -- Calculate progress towards 60-day goal
    v_goal_60_progress := LEAST(v_streak, 60);
    
    -- Upsert into user_goals
    INSERT INTO user_goals (
        user_id,
        posting_streak,
        longest_posting_streak,
        last_posted_date,
        posts_this_week,
        posting_days_this_week,
        goal_60_progress,
        updated_at
    ) VALUES (
        p_user_id,
        v_streak,
        v_longest_streak,
        v_current_date,
        v_posts_this_week,
        v_posting_days_this_week,
        v_goal_60_progress,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        posting_streak = EXCLUDED.posting_streak,
        longest_posting_streak = EXCLUDED.longest_posting_streak,
        last_posted_date = EXCLUDED.last_posted_date,
        posts_this_week = EXCLUDED.posts_this_week,
        posting_days_this_week = EXCLUDED.posting_days_this_week,
        goal_60_progress = EXCLUDED.goal_60_progress,
        updated_at = NOW();
END;
$$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_goals_posting_days_week 
ON user_goals(posting_days_this_week);
