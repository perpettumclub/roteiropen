-- ============================================================
-- Migration: Expand social_metrics table with Instagram Insights fields
-- Date: 2026-01-28
-- Purpose: Add all fields extracted from Instagram Insights print via OCR
-- ============================================================

-- From Profile Print (some already exist)
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS seguindo integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS posts integer;

-- From Insights Print (NEW - extracted via OCR)
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS contas_alcancadas integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS contas_com_engajamento integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS impressoes integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS interacoes integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS cliques_site integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS cliques_email integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS visitas_perfil integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS saves integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS shares integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS comentarios_periodo integer;
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS likes_periodo integer;

-- Calculated field
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS engajamento_percent numeric(5,2);

-- Rename 'followers' to 'seguidores' for consistency (optional, keep both for backwards compat)
-- ALTER TABLE public.social_metrics RENAME COLUMN followers TO seguidores;
-- For now, just add seguidores as alias
ALTER TABLE public.social_metrics ADD COLUMN IF NOT EXISTS seguidores integer;

-- Create index for faster queries on user metrics history
CREATE INDEX IF NOT EXISTS idx_social_metrics_user_created 
    ON public.social_metrics(user_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.social_metrics IS 'Stores Instagram metrics extracted from user-uploaded prints via OCR. All data persists permanently for historical tracking.';
