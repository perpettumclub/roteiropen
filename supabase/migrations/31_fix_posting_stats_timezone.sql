-- Migration 31: DEFINITIVE FIX for posting stats
-- Run this ONCE in Supabase SQL Editor
-- Fixes: corrupted timestamps + RPC timezone handling

-- ============================================================
-- STEP 1: Fix corrupted posted_at timestamps
-- The old frontend code subtracted 3 hours from UTC before saving,
-- creating timestamps that are "Brasilia time labeled as UTC".
-- Since the column is TIMESTAMPTZ, we need to add 3 hours back
-- to make them proper UTC.
-- ============================================================

-- First, let's see what we're fixing (DIAGNOSTIC - you can run this alone first)
-- SELECT id, posted_at, posted_at + INTERVAL '3 hours' as fixed_time
-- FROM frequency_scripts WHERE posted_at IS NOT NULL LIMIT 10;

-- Apply the fix to ALL existing posted_at timestamps
UPDATE frequency_scripts 
SET posted_at = posted_at + INTERVAL '3 hours'
WHERE posted_at IS NOT NULL;

-- ============================================================
-- STEP 2: Recreate update_posting_stats with proper TIMESTAMPTZ handling
-- ============================================================

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
    v_total_unique_days INTEGER := 0;
BEGIN
    -- Get today's date in Brasilia timezone
    v_current_date := (NOW() AT TIME ZONE 'America/Sao_Paulo')::date;
    v_check_date := v_current_date;
    
    -- Calculate consecutive posting streak
    -- For TIMESTAMPTZ: convert to Brasilia time, then extract date
    WHILE EXISTS (
        SELECT 1 FROM frequency_scripts
        WHERE user_id = p_user_id
        AND (posted_at AT TIME ZONE 'America/Sao_Paulo')::date = v_check_date
        AND posted_at IS NOT NULL
    ) LOOP
        v_streak := v_streak + 1;
        v_check_date := v_check_date - 1;
    END LOOP;
    
    -- Get longest streak
    SELECT COALESCE(longest_posting_streak, 0) INTO v_longest_streak
    FROM user_goals WHERE user_id = p_user_id;
    
    IF v_streak > v_longest_streak THEN
        v_longest_streak := v_streak;
    END IF;
    
    -- Week start (Monday) in Brasilia
    -- PostgreSQL DATE_TRUNC('week', ...) starts on Monday by default with ISO weeks
    
    -- Count total posts this week
    SELECT COUNT(*) INTO v_posts_this_week
    FROM frequency_scripts
    WHERE user_id = p_user_id
    AND (posted_at AT TIME ZONE 'America/Sao_Paulo')::date >= DATE_TRUNC('week', v_current_date::timestamp)::date
    AND posted_at IS NOT NULL;
    
    -- Count unique Brasilia dates with posts this week
    SELECT COUNT(DISTINCT (posted_at AT TIME ZONE 'America/Sao_Paulo')::date) INTO v_posting_days_this_week
    FROM frequency_scripts
    WHERE user_id = p_user_id
    AND (posted_at AT TIME ZONE 'America/Sao_Paulo')::date >= DATE_TRUNC('week', v_current_date::timestamp)::date
    AND posted_at IS NOT NULL;
    
    -- Goal 60: total unique posting days ever (not just streak)
    SELECT COUNT(DISTINCT (posted_at AT TIME ZONE 'America/Sao_Paulo')::date) INTO v_total_unique_days
    FROM frequency_scripts
    WHERE user_id = p_user_id
    AND posted_at IS NOT NULL;
    
    v_goal_60_progress := LEAST(v_total_unique_days, 60);
    
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
        longest_posting_streak = GREATEST(user_goals.longest_posting_streak, EXCLUDED.longest_posting_streak),
        last_posted_date = EXCLUDED.last_posted_date,
        posts_this_week = EXCLUDED.posts_this_week,
        posting_days_this_week = EXCLUDED.posting_days_this_week,
        goal_60_progress = EXCLUDED.goal_60_progress,
        updated_at = NOW();
END;
$$;

-- ============================================================
-- STEP 3: Re-run the RPC for ALL users to recalculate cached stats
-- ============================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT DISTINCT user_id FROM frequency_scripts WHERE posted_at IS NOT NULL
    LOOP
        PERFORM update_posting_stats(r.user_id);
    END LOOP;
END $$;

-- ============================================================
-- VERIFICATION: Run this after to check the results
-- ============================================================

-- Check corrected user_goals
SELECT user_id, posting_streak, posting_days_this_week, goal_60_progress, last_posted_date
FROM user_goals;

-- Check corrected timestamps
SELECT id, posted_at, (posted_at AT TIME ZONE 'America/Sao_Paulo')::date as brasilia_date
FROM frequency_scripts 
WHERE posted_at IS NOT NULL 
ORDER BY posted_at DESC
LIMIT 10;
