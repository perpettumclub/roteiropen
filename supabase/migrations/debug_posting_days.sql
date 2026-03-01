-- DEBUG: Test posting_days_this_week calculation
-- Run this in Supabase SQL Editor to check if the function works

-- 1. Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
AND column_name = 'posting_days_this_week';

-- 2. Check current values in user_goals
SELECT 
    user_id,
    posting_streak,
    posts_this_week,
    posting_days_this_week,
    goal_60_progress,
    last_posted_date,
    updated_at
FROM user_goals
LIMIT 5;

-- 3. Check posted_at dates in frequency_scripts (this week)
SELECT 
    user_id,
    posted_at,
    posted_at::date as post_date,
    DATE_TRUNC('week', CURRENT_DATE) as week_start
FROM frequency_scripts
WHERE posted_at IS NOT NULL
AND posted_at >= DATE_TRUNC('week', CURRENT_DATE)
ORDER BY posted_at DESC
LIMIT 20;

-- 4. Manually calculate unique posting days this week
SELECT 
    user_id,
    COUNT(DISTINCT posted_at::date) as unique_days_posted
FROM frequency_scripts
WHERE posted_at >= DATE_TRUNC('week', CURRENT_DATE)
AND posted_at IS NOT NULL
GROUP BY user_id;

-- 5. Test the function for your user (replace YOUR_USER_ID)
-- Get your user_id first:
SELECT auth.uid() as your_user_id;

-- Then call the function (replace with your actual user_id from above):
-- SELECT update_posting_stats('YOUR_USER_ID_HERE');

-- 6. Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'update_posting_stats';
