-- Adicionar coluna de comissão na tabela affiliates
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS commission_percent numeric(5,2) DEFAULT 20.00;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Permitir service_role inserir/atualizar afiliados
CREATE POLICY IF NOT EXISTS "Service role manage affiliates"
    ON affiliates FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
