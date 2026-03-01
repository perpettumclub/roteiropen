-- =====================================================
-- HOOKY - SISTEMA DE ASSINATURAS (PARTE 2)
-- Execute este script DEPOIS do Parte 1
-- =====================================================

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 3. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert subscriptions" ON subscriptions;
CREATE POLICY "Service role can insert subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (TRUE);

-- 5. FUNÇÃO: Verificar assinatura ativa
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

-- 6. FUNÇÃO: Obter minha assinatura
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

-- 7. FUNÇÃO: Cancelar minha assinatura
CREATE OR REPLACE FUNCTION cancel_my_subscription()
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE subscriptions
    SET 
        status = 'cancelled',
        auto_renew = FALSE,
        cancelled_at = NOW()
    WHERE user_id = auth.uid()
    AND status = 'active';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO: Toggle renovação automática
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

-- Pronto!
SELECT 'Scripts executados com sucesso!' as resultado;
