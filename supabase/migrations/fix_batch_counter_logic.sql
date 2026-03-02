-- Update function to get global stats including subscription batch count
CREATE OR REPLACE FUNCTION get_global_script_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  scripts_count BIGINT;
  anon_count BIGINT;
  creators_count BIGINT;
BEGIN
  -- 1. Total scripts generated (real + anonymous)
  SELECT COUNT(*) INTO scripts_count FROM public.frequency_scripts;
  SELECT COUNT(*) INTO anon_count FROM public.anonymous_stats;
  
  -- 2. "Batch" count: Number of people who joined (active + trial + pending)
  -- This is more accurate for "Lotes" as it counts everyone who signed up for the offer
  SELECT COUNT(DISTINCT user_id) INTO creators_count 
  FROM public.subscriptions 
  WHERE status IN ('active', 'trial', 'pending');

  -- Fallback if subscriptions is empty, count unique script creators
  IF creators_count = 0 THEN
    SELECT COUNT(DISTINCT user_id) INTO creators_count FROM public.frequency_scripts;
  END IF;

  RETURN json_build_object(
    'total_scripts', scripts_count + anon_count,
    'total_creators', creators_count
  );
END;
$$;

-- Ensure execution remains public for guest users
GRANT EXECUTE ON FUNCTION get_global_script_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_global_script_stats() TO authenticated;
