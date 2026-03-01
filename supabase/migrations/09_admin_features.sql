-- Migration: Admin Features & Events
-- Execute no Supabase SQL Editor

-- 1. Helper Function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.jwt() ->> 'email' = 'felipevidalbk@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Modules RLS
-- Allow Admin to Insert/Update/Delete
DROP POLICY IF EXISTS "Modules visible to desafio_45 users" ON modules;
DROP POLICY IF EXISTS "Read modules" ON modules;
DROP POLICY IF EXISTS "Admin insert modules" ON modules;
DROP POLICY IF EXISTS "Admin update modules" ON modules;
DROP POLICY IF EXISTS "Admin delete modules" ON modules;


-- Read: Public (or restricted to students, keeping existing mechanic logic but refining)
CREATE POLICY "Read modules" ON modules
    FOR SELECT USING (
        is_published = true 
        OR is_admin() -- Admin sees unpublished
    );

CREATE POLICY "Admin insert modules" ON modules
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin update modules" ON modules
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin delete modules" ON modules
    FOR DELETE USING (is_admin());

-- 3. Update Lessons RLS
-- Add columns first
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Policies
DROP POLICY IF EXISTS "Allow public read lessons" ON lessons;
DROP POLICY IF EXISTS "Read lessons" ON lessons;
DROP POLICY IF EXISTS "Admin insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admin update lessons" ON lessons;
DROP POLICY IF EXISTS "Admin delete lessons" ON lessons;

CREATE POLICY "Read lessons" ON lessons
    FOR SELECT USING (true); -- Authenticated users can read lessons

CREATE POLICY "Admin insert lessons" ON lessons
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin update lessons" ON lessons
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin delete lessons" ON lessons
    FOR DELETE USING (is_admin());


-- 4. Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    link TEXT, -- Zoom/Meet link
    image_url TEXT,
    host TEXT, -- "Professor / Anfitrião"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read events" ON events;
DROP POLICY IF EXISTS "Admin insert events" ON events;
DROP POLICY IF EXISTS "Admin update events" ON events;
DROP POLICY IF EXISTS "Admin delete events" ON events;

CREATE POLICY "Read events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Admin insert events" ON events
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin update events" ON events
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin delete events" ON events
    FOR DELETE USING (is_admin());
