-- =====================================================
-- HOOKY - SISTEMA DE CUPONS DE DESCONTO
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,           -- Ex: "LANCAMENTO50"
    discount_type VARCHAR(20) NOT NULL,          -- 'percentage' ou 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,      -- 50 (%) ou 25.00 (R$)
    max_uses INTEGER DEFAULT NULL,               -- NULL = ilimitado
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,                      -- NULL = sem expiração
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HISTÓRICO DE USO DE CUPONS
CREATE TABLE IF NOT EXISTS coupon_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- Cupons ativos podem ser lidos por qualquer usuário autenticado (para validação)
CREATE POLICY "Authenticated users can read active coupons" ON coupons
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Usuários só veem seus próprios usos de cupons
CREATE POLICY "Users can see own coupon uses" ON coupon_uses
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Service role pode fazer tudo (para o backend)
CREATE POLICY "Service role full access coupons" ON coupons
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "Service role full access coupon_uses" ON coupon_uses
    FOR ALL TO service_role
    USING (true);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user ON coupon_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon ON coupon_uses(coupon_id);

-- 5. FUNÇÃO PARA VALIDAR CUPOM
CREATE OR REPLACE FUNCTION validate_coupon(coupon_code TEXT)
RETURNS TABLE (
    id UUID,
    code VARCHAR(50),
    discount_type VARCHAR(20),
    discount_value DECIMAL(10, 2),
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
BEGIN
    -- Buscar cupom
    SELECT * INTO coupon_record
    FROM coupons c
    WHERE UPPER(c.code) = UPPER(coupon_code)
    LIMIT 1;
    
    -- Cupom não existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR(50), NULL::VARCHAR(20), NULL::DECIMAL(10,2),
            FALSE, 'Cupom não encontrado'::TEXT;
        RETURN;
    END IF;
    
    -- Cupom inativo
    IF NOT coupon_record.is_active THEN
        RETURN QUERY SELECT 
            coupon_record.id, coupon_record.code, coupon_record.discount_type, coupon_record.discount_value,
            FALSE, 'Cupom inativo'::TEXT;
        RETURN;
    END IF;
    
    -- Cupom expirado
    IF coupon_record.expires_at IS NOT NULL AND coupon_record.expires_at < NOW() THEN
        RETURN QUERY SELECT 
            coupon_record.id, coupon_record.code, coupon_record.discount_type, coupon_record.discount_value,
            FALSE, 'Cupom expirado'::TEXT;
        RETURN;
    END IF;
    
    -- Cupom esgotado
    IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
        RETURN QUERY SELECT 
            coupon_record.id, coupon_record.code, coupon_record.discount_type, coupon_record.discount_value,
            FALSE, 'Cupom esgotado'::TEXT;
        RETURN;
    END IF;
    
    -- Cupom válido!
    RETURN QUERY SELECT 
        coupon_record.id, coupon_record.code, coupon_record.discount_type, coupon_record.discount_value,
        TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CUPOM DE TESTE (remover em produção se necessário)
INSERT INTO coupons (code, discount_type, discount_value, max_uses)
VALUES ('LANCAMENTO50', 'percentage', 50, 100);

-- Verificar se tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('coupons', 'coupon_uses');
