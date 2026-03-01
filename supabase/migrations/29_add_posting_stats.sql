-- Add posting streak columns to user_goals table
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS posting_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_posting_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_posted_date DATE,
ADD COLUMN IF NOT EXISTS posts_this_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_60_progress INTEGER DEFAULT 0;

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_user_goals_posting_streak 
ON public.user_goals(posting_streak);

CREATE INDEX IF NOT EXISTS idx_user_goals_last_posted 
ON public.user_goals(last_posted_date);

-- Function to update posting stats (can be called from triggers or app)
CREATE OR REPLACE FUNCTION update_posting_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_streak INTEGER := 0;
    v_current_date DATE := CURRENT_DATE;
    v_check_date DATE;
    v_has_post BOOLEAN;
BEGIN
    -- Calculate streak by checking consecutive days with posted_at
    v_check_date := v_current_date;
    
    -- Check if posted today first
    SELECT EXISTS(
        SELECT 1 FROM public.frequency_scripts 
        WHERE user_id = p_user_id 
        AND DATE(posted_at AT TIME ZONE 'America/Sao_Paulo') = v_check_date
    ) INTO v_has_post;
    
    -- If not posted today, start counting from yesterday
    IF NOT v_has_post THEN
        v_check_date := v_current_date - INTERVAL '1 day';
    END IF;
    
    -- Count consecutive posting days
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.frequency_scripts 
            WHERE user_id = p_user_id 
            AND DATE(posted_at AT TIME ZONE 'America/Sao_Paulo') = v_check_date
        ) INTO v_has_post;
        
        IF v_has_post THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    -- Update user_goals
    INSERT INTO public.user_goals (user_id, posting_streak, longest_posting_streak, last_posted_date, posts_this_week, goal_60_progress)
    VALUES (
        p_user_id,
        v_streak,
        v_streak,
        v_current_date,
        (SELECT COUNT(*) FROM public.frequency_scripts 
         WHERE user_id = p_user_id 
         AND posted_at >= DATE_TRUNC('week', CURRENT_DATE)
         AND posted_at IS NOT NULL),
        LEAST(v_streak, 60)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        posting_streak = EXCLUDED.posting_streak,
        longest_posting_streak = GREATEST(user_goals.longest_posting_streak, EXCLUDED.posting_streak),
        last_posted_date = EXCLUDED.last_posted_date,
        posts_this_week = EXCLUDED.posts_this_week,
        goal_60_progress = EXCLUDED.goal_60_progress;
END;
$$ LANGUAGE plpgsql;
