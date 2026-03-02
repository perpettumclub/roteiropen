-- Create a table for anonymous statistics
CREATE TABLE IF NOT EXISTS public.anonymous_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'script_created'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous inserts (public access)
ALTER TABLE public.anonymous_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.anonymous_stats
    FOR INSERT WITH CHECK (true);

-- Allow everyone to read (for the global counter)
CREATE POLICY "Allow public read access" ON public.anonymous_stats
    FOR SELECT USING (true);

-- Update useGlobalStats logic to include anonymous counts
-- totalScripts = BASE_SCRIPTS + real scripts (frequency_scripts) + anonymous scripts (anonymous_stats)
