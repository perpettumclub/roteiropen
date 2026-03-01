-- Migration: Community Moderation (Delete Policies)
-- Execute no Supabase SQL Editor

-- 1. Helper Function: is_admin() (Already exists in 09, but ensuring availability)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.jwt() ->> 'email' = 'felipevidalbk@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Policies for Community Posts

-- Drop existing delete policy if any
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Admin can delete any post" ON community_posts;
DROP POLICY IF EXISTS "Delete posts" ON community_posts;

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
ON community_posts
FOR DELETE
USING ( auth.uid() = author_id );

-- Allow Admin to delete ANY post
CREATE POLICY "Admin can delete any post"
ON community_posts
FOR DELETE
USING ( is_admin() );


-- 3. Policies for Post Comments (If table exists)
-- Assuming table name is 'post_comments' or similar. 
-- Checking if table exists first to avoid errors.

DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_comments') THEN
        
        DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
        DROP POLICY IF EXISTS "Admin can delete any comment" ON post_comments;
        
        CREATE POLICY "Users can delete own comments"
        ON post_comments
        FOR DELETE
        USING ( auth.uid() = author_id );

        CREATE POLICY "Admin can delete any comment"
        ON post_comments
        FOR DELETE
        USING ( is_admin() );
        
    END IF;
END $$;
