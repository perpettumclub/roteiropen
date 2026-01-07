-- Tabela para armazenar códigos de verificação de email
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscas rápidas por email
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);

-- RLS: Apenas service role pode acessar (via Edge Functions)
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Limpar códigos antigos (opcional - pode criar um cron job)
-- DELETE FROM email_verification_codes WHERE expires_at < NOW() - INTERVAL '1 day';
