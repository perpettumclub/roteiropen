-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT, -- Vimeo/YouTube URL
    duration TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read lessons"
ON public.lessons FOR SELECT
USING (true);

-- Create lesson_progress table (granular tracking per lesson)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read progress"
ON public.lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow individual update progress"
ON public.lesson_progress FOR ALL
USING (auth.uid() = user_id);

-- DATA MIGRATION: 
-- Creates a 'Lesson 1' for each existing Module, using the module's video_url
INSERT INTO public.lessons (module_id, title, description, video_url, duration, order_index)
SELECT 
    id as module_id, 
    'Aula 1: ' || title as title, 
    description, 
    video_url, 
    duration, 
    0
FROM public.modules
WHERE video_url IS NOT NULL;
