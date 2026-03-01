-- ============================================================
-- Migration: Create email_logs table for tracking sent emails
-- Date: 2026-01-28
-- Purpose: Track all automated emails to prevent spam and enable analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email_type text NOT NULL, 
    -- Types: 'upload_confirmation', 'goal_proximity', 'goal_achieved', 
    --        'reengagement_7d', 'reengagement_15d', 'reengagement_30d'
    sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    -- metadata example: {"seguidores": 8500, "meta": 10000, "percent": 85}
    
    CONSTRAINT valid_email_type CHECK (email_type IN (
        'upload_confirmation',
        'goal_proximity',
        'goal_achieved',
        'reengagement_7d',
        'reengagement_15d',
        'reengagement_30d'
    ))
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own email logs
CREATE POLICY "Users can view their own email logs"
    ON public.email_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Only backend/service role can insert (not users directly)
CREATE POLICY "Service role can insert email logs"
    ON public.email_logs FOR INSERT
    WITH CHECK (true); -- Will be called via service_role key from backend

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type 
    ON public.email_logs(user_id, email_type);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_sent 
    ON public.email_logs(user_id, sent_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.email_logs IS 'Tracks all automated emails sent to users. Used to prevent duplicate emails and for analytics.';
