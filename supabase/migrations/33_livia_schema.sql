-- Migração para a Plataforma Lívia (Smart Sites)

-- 1. Tabela de Organizações (Clientes do SaaS)
CREATE TABLE IF NOT EXISTS agent_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- O @username (ex: 'alvenaria-premium')
    name TEXT NOT NULL,
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL, -- WhatsApp para onde as notificações serão enviadas
    welcome_message TEXT DEFAULT 'Olá! Como posso te ajudar hoje?',
    system_prompt TEXT NOT NULL, -- Instruções específicas para a IA (contexto da empresa)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Interações (Leads/Atendimentos)
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES agent_organizations(id) ON DELETE CASCADE,
    visitor_id UUID, -- Caso queira rastrear visitantes recorrentes
    audio_url TEXT, -- Link para o áudio no Storage
    transcript TEXT, -- Transcrição feita pelo Whisper
    summary TEXT, -- Resumo formatado pela IA (o "Dossiê")
    lead_data JSONB, -- Dados extraídos (nome, fone, tipo_obra, orcamento)
    status TEXT DEFAULT 'pending', -- pending, sent_to_whatsapp, archived
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE agent_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas Simples (Permitir leitura pública por slug para o Agent Page)
CREATE POLICY "Allow public read by slug" ON agent_organizations
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous interaction creation" ON agent_interactions
    FOR INSERT WITH CHECK (true);
