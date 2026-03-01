-- Migration: 26_create_progress_badges.sql
-- Creates the progress_badges table for follower milestone tracking

-- Create progress_badges table (different from existing user_badges)
CREATE TABLE IF NOT EXISTS progress_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_slug TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_slug)
);

-- Enable Row Level Security
ALTER TABLE progress_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress badges
CREATE POLICY "Users can view own progress badges"
ON progress_badges FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can earn progress badges
CREATE POLICY "Users can earn progress badges"
ON progress_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_badges_user_id ON progress_badges(user_id);

-- Follower Milestone Badges:
-- followers_1k, followers_5k, followers_10k
-- followers_25k, followers_50k, followers_100k
-- goal_achieved
