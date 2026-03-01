-- Add persistence for Streak and Weekly Goal
alter table public.user_goals
add column if not exists current_streak integer default 0,
add column if not exists longest_streak integer default 0,
add column if not exists last_active_date date,
add column if not exists weekly_scripts_goal integer default 3; -- Defaulting to 3 as seen in dashboard

-- Update RLS (Policies usually cover updates, but good to check if new columns need logic)
-- Existing policies on user_goals are "FOR ALL" or "FOR INSERT/UPDATE", so they should cover these new columns automatically.
