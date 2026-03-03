-- Porteiro: Novas contas não recebem scripts grátis automaticamente
-- Acesso ao App exige assinatura hooky_pro confirmada por webhook
ALTER TABLE public.profiles
ALTER COLUMN free_scripts_limit SET DEFAULT 0;

-- Zerar contas existentes que nunca pagaram (não tem assinatura ativa)
UPDATE public.profiles
SET free_scripts_limit = 0
WHERE id NOT IN (
    SELECT user_id FROM subscriptions WHERE status = 'active'
)
AND tier IS DISTINCT FROM 'hooky_pro';
