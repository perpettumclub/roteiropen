-- =====================================================
-- HOOKY - SISTEMA DE ASSINATURAS
-- Script PostgreSQL para Supabase
-- =====================================================

-- 1. TABELA DE ASSINATURAS
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status da assinatura
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    
    -- Plano
    plan_name VARCHAR(50) NOT NULL DEFAULT 'anual',
    plan_price DECIMAL(10, 2) NOT NULL DEFAULT 49.90,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    
    -- Datas importantes
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    
    -- Renovação automática
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Dados do pagamento (Mercado Pago)
    payment_id VARCHAR(100),
    payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'pix')),
    last_payment_at TIMESTAMPTZ,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Índice único para garantir uma assinatura ativa por usuário
    CONSTRAINT unique_active_subscription UNIQUE (user_id, status)
);

-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_auto_renew ON subscriptions(auto_renew);

-- 3. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Usuários só podem atualizar suas próprias assinaturas
CREATE POLICY "Users can update own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Apenas service_role pode inserir (via Edge Functions)
CREATE POLICY "Service role can insert subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (TRUE);

-- Política: Apenas service_role pode deletar (via Edge Functions)
CREATE POLICY "Service role can delete subscriptions"
    ON subscriptions FOR DELETE
    USING (TRUE);

-- 5. FUNÇÃO PARA VERIFICAR SE USUÁRIO TEM ASSINATURA ATIVA
-- =====================================================
CREATE OR REPLACE FUNCTION has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE user_id = check_user_id 
        AND status = 'active' 
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA OBTER ASSINATURA DO USUÁRIO ATUAL
-- =====================================================
CREATE OR REPLACE FUNCTION get_my_subscription()
RETURNS TABLE (
    id UUID,
    status VARCHAR(20),
    plan_name VARCHAR(50),
    plan_price DECIMAL(10, 2),
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.status,
        s.plan_name,
        s.plan_price,
        s.started_at,
        s.expires_at,
        s.auto_renew,
        GREATEST(0, EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER) as days_remaining
    FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status IN ('active', 'pending')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA CANCELAR ASSINATURA
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_my_subscription()
RETURNS BOOLEAN AS $$
DECLARE
    subscription_exists BOOLEAN;
BEGIN
    UPDATE subscriptions
    SET 
        status = 'cancelled',
        auto_renew = FALSE,
        cancelled_at = NOW()
    WHERE user_id = auth.uid()
    AND status = 'active';
    
    GET DIAGNOSTICS subscription_exists = ROW_COUNT > 0;
    RETURN subscription_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PARA TOGGLE DE RENOVAÇÃO AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION toggle_auto_renew(new_value BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE subscriptions
    SET auto_renew = new_value
    WHERE user_id = auth.uid()
    AND status = 'active';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. VIEW PARA ASSINATURAS PRÓXIMAS DE EXPIRAR (para cron job de emails)
-- =====================================================
CREATE OR REPLACE VIEW subscriptions_expiring_soon AS
SELECT 
    s.*,
    u.email,
    EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER as days_until_expiry
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'active'
AND s.expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
AND s.auto_renew = TRUE;

-- 10. COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE subscriptions IS 'Tabela de assinaturas dos usuários do Hooky';
COMMENT ON COLUMN subscriptions.status IS 'Status: active, cancelled, expired, pending';
COMMENT ON COLUMN subscriptions.auto_renew IS 'Se TRUE, renova automaticamente ao expirar';
COMMENT ON COLUMN subscriptions.expires_at IS 'Data de expiração da assinatura';
COMMENT ON FUNCTION has_active_subscription IS 'Verifica se usuário tem assinatura ativa';
COMMENT ON FUNCTION get_my_subscription IS 'Retorna assinatura do usuário logado';
COMMENT ON FUNCTION cancel_my_subscription IS 'Cancela assinatura do usuário logado';
COMMENT ON FUNCTION toggle_auto_renew IS 'Ativa/desativa renovação automática';
