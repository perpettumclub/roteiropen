-- View para Leaderboard (Ranking de Pontos)
-- Pontuação: 100 pontos por módulo concluído

CREATE OR REPLACE VIEW leaderboard AS
  SELECT 
    p.id as user_id,
    COALESCE(p.full_name, 'Membro ' || SUBSTRING(p.id::text, 1, 4)) as full_name,
    p.avatar_url,
    COUNT(up.id) FILTER (WHERE up.completed = true) * 100 as points
  FROM profiles p
  LEFT JOIN user_progress up ON p.id = up.user_id
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY points DESC;

-- Liberar acesso de leitura para todos os usuários autenticados
GRANT SELECT ON leaderboard TO authenticated;
