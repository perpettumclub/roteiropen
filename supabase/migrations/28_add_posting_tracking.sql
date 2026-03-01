-- Add posting tracking columns to frequency_scripts table
ALTER TABLE public.frequency_scripts 
ADD COLUMN posted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN posted_platform TEXT,
ADD COLUMN not_posted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX frequency_scripts_posted_at_idx 
ON public.frequency_scripts(user_id, posted_at) 
WHERE posted_at IS NOT NULL;

CREATE INDEX frequency_scripts_not_posted_at_idx
ON public.frequency_scripts(user_id, not_posted_at)
WHERE not_posted_at IS NOT NULL;

-- Create view for user posting stats
CREATE OR REPLACE VIEW user_posting_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE posted_at IS NOT NULL) as total_posted,
  COUNT(*) FILTER (WHERE not_posted_at IS NOT NULL) as total_not_posted,
  COUNT(*) FILTER (
    WHERE posted_at >= CURRENT_DATE - INTERVAL '7 days' 
    AND posted_at IS NOT NULL
  ) as posts_this_week,
  COUNT(*) FILTER (
    WHERE not_posted_at >= CURRENT_DATE - INTERVAL '7 days' 
    AND not_posted_at IS NOT NULL
  ) as not_posted_this_week,
  MAX(posted_at) as last_post_date,
  MAX(not_posted_at) as last_not_posted_date
FROM public.frequency_scripts
GROUP BY user_id;
