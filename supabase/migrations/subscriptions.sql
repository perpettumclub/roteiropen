-- Tabela de assinaturas (source of truth para status de pagamento)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'trial', 'inactive', 'cancelled', 'pending')),
    plan TEXT NOT NULL DEFAULT 'annual' CHECK (plan IN ('monthly', 'annual', 'lifetime')),
    price_paid DECIMAL(10, 2),
    mercadopago_payment_id TEXT,
    mercadopago_subscription_id TEXT,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuário só pode ver sua própria assinatura
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Apenas service_role pode inserir/atualizar (via Edge Functions)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
