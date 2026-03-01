-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
-- Allow everyone to read posts (or restrict to authenticated)
CREATE POLICY "Allow public read posts"
ON public.community_posts FOR SELECT
USING (true);

-- Allow authenticated users to insert posts
CREATE POLICY "Allow authenticated insert posts"
ON public.community_posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Allow authors to update/delete their own posts
CREATE POLICY "Allow authors update posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Allow authors delete posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = author_id);

-- Policies for post_likes
CREATE POLICY "Allow public read likes"
ON public.post_likes FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated interact likes"
ON public.post_likes FOR ALL
USING (auth.uid() = user_id);

-- Function to handle like counting (Optional, but good for performance)
-- We'll keep it simple for now and rely on client-side or separate counts, 
-- implies the client updates the count or triggers a function. 
-- For now, let's just create the tables.
