-- =====================================================
-- HOOKY - SISTEMA DE ASSINATURAS (PARTE 1)
-- Execute este script PRIMEIRO
-- =====================================================

-- Dropar tabela se existir (para recomeçar limpo)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 1. TABELA DE ASSINATURAS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status da assinatura
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
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
    payment_method VARCHAR(20),
    last_payment_at TIMESTAMPTZ,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verificar se a tabela foi criada
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions';
