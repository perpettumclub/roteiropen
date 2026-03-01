-- Migration: Storage Bucket for Images
-- Execute no Supabase SQL Editor

-- 1. Create Bucket 'images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for Storage
-- Allow Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow Admin Upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' 
    AND (auth.jwt() ->> 'email') = 'felipevidalbk@gmail.com'
);

-- Allow Admin Update/Delete
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images' 
    AND (auth.jwt() ->> 'email') = 'felipevidalbk@gmail.com'
);

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND (auth.jwt() ->> 'email') = 'felipevidalbk@gmail.com'
);
