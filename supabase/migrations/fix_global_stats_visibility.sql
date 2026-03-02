-- Function to get global stats securely for anonymous users
CREATE OR REPLACE FUNCTION get_global_script_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS for counting only
AS $$
DECLARE
  scripts_count BIGINT;
  anon_count BIGINT;
  creators_count BIGINT;
BEGIN
  -- Count from real scripts
  SELECT COUNT(*) INTO scripts_count FROM public.frequency_scripts;
  
  -- Count from anonymous events
  SELECT COUNT(*) INTO anon_count FROM public.anonymous_stats;
  
  -- Count unique creators
  SELECT COUNT(DISTINCT user_id) INTO creators_count FROM public.frequency_scripts;

  RETURN json_build_object(
    'total_scripts', scripts_count + anon_count,
    'total_creators', creators_count
  );
END;
$$;

-- Grant execution to everyone
GRANT EXECUTE ON FUNCTION get_global_script_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_global_script_stats() TO authenticated;
