-- Corrigido: remove inflação por sessões anônimas e subscriptions pending
CREATE OR REPLACE FUNCTION get_global_script_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  scripts_count BIGINT;
  creators_count BIGINT;
BEGIN
  -- 1. Apenas roteiros reais de usuários autenticados
  SELECT COUNT(*) INTO scripts_count FROM public.frequency_scripts;

  -- 2. Todos que ativaram o freemium ou pagaram — qualquer registro em subscriptions
  SELECT COUNT(DISTINCT user_id) INTO creators_count FROM public.subscriptions;

  RETURN json_build_object(
    'total_scripts', scripts_count,
    'total_creators', creators_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_global_script_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_global_script_stats() TO authenticated;
