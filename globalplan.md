# 🌍 Plano de Expansão Global - Hooky AI

**Objetivo:** Lançar o Hooky para mercado global com pricing regional e hard paywall otimizado.

**Status:** Em preparação (arquivos de configuração criados em `/translate`)

---

## 📊 Estratégia de Negócio

### Pricing Regional (PPP - Purchasing Power Parity)

| Mercado | Gateway      | Preço    | Moeda | Justificativa                          |
|---------|--------------|----------|-------|----------------------------------------|
| Brasil  | Mercado Pago | R$ 67    | BRL   | Acessível mas sério, não queima margem |
| Global  | Stripe       | US$ 67   | USD   | Preço premium para early adopters      |

**Observações:**
- Mesmo produto, backends compartilhados
- Detecção automática por IP (Brasil vs Resto do Mundo)
- R$ 67 mantém margem saudável no BR (~R$ 60 líquido após taxas)
- US$ 67 = R$ 386 (5.7x mais receita por cliente global)

### Evolução de Preços (Roadmap)

**Fase 1 (Lançamento):**
- Brasil: R$ 67/ano
- Global: US$ 67/ano

**Fase 2 (Após 500 clientes):**
- Brasil: R$ 67 (mantém)
- Global: US$ 97 (aumenta)
- Introduz tier "Pro" com features extras

**Fase 3 (Maturidade):**
- PPP completo: Índia US$ 27, México US$ 37, etc
- Mantém US$ 97 para tier 1 (EUA, UK, EU)

---

## 🎯 Hard Paywall - "Degustação Bloqueada PLUS"

### Como Funciona

```
1. Usuário grava áudio (0 custo de API)
2. Vê preview turvo do roteiro (título + gancho)
3. Paywall: "Desbloqueie por R$ 67/ano"
4. Após pagamento: gera roteiro + acesso ilimitado
```

### Vantagens vs Trial

| Trial (3 dias grátis)       | Degustação Bloqueada           |
|-----------------------------|--------------------------------|
| Conversão: 2-4%             | Conversão: 8-12%               |
| Custo: R$ 2-3 por trial     | Custo: R$ 0 antes do pagamento |
| Chargeback alto             | Chargeback baixo               |
| Abuso (scripts grátis)      | Sem abuso possível             |

### Implementação Técnica

**Fluxo atual (modificar):**
```tsx
// src/features/script/ProcessingView.tsx
// Adicionar lógica:
if (!isPremium && freeScriptsRemaining === 0) {
  return <BlurredPreview script={script} onUpgrade={openPaywall} />;
}
```

**Novo componente:**
```tsx
// src/features/script/BlurredPreview.tsx
- Mostra título + gancho (legível)
- Resto do roteiro fica turvo (CSS: filter: blur(8px))
- CTA: "Desbloqueie Agora por R$ 67"
```

---

## 🌐 Internacionalização (i18n)

### Arquitetura

**1 codebase, 2 idiomas:**
- Detecção automática pelo navegador
- Forçar idioma via URL: `?lng=en` ou `?lng=pt`
- Salva preferência em localStorage

### Status Atual

✅ **Preparado (em `/translate`):**
- Configuração i18n (`config/i18n.ts`)
- Traduções completas (`locales/en.json`, `locales/pt.json`)
- Exemplo de uso (`examples/ExampleComponent.tsx`)
- README com instruções

❌ **Falta Implementar:**
- Copiar arquivos para `src/`
- Refatorar componentes para usar traduções
- Testar troca de idioma

### Componentes Prioritários (Refatorar Primeiro)

**Críticos (afetam conversão):**
1. `LandingView.tsx` - Hero da home
2. `Paywall.tsx` - Tela de upgrade
3. `CheckoutScreen.tsx` - Checkout

**Importantes (UX):**
4. `Dashboard.tsx` - Painel principal
5. `AudioRecorder.tsx` - Gravador
6. `ScriptOutput.tsx` - Resultado

**Secundários (pode deixar PT):**
- Configurações
- Perfil
- Mensagens de erro internas

### Estimativa de Trabalho

| Tarefa                          | Tempo  |
|---------------------------------|--------|
| Copiar arquivos i18n para src/  | 10 min |
| Refatorar LandingView           | 1h     |
| Refatorar Paywall               | 1h     |
| Refatorar Checkout              | 1h     |
| Refatorar Dashboard             | 2h     |
| Refatorar outros componentes    | 3h     |
| Testes e ajustes                | 1h     |
| **TOTAL**                       | **~9h**|

---

## 💳 Gateway Duplo de Pagamento

### Arquitetura

```
Usuário acessa checkout
        ↓
API detecta país pelo IP
        ↓
┌────────────────────────────────┐
│ IP do Brasil?                  │
│ ├── SIM → Mercado Pago (R$ 67)│
│ └── NÃO → Stripe (US$ 67)      │
└────────────────────────────────┘
```

### Arquivos Criados (em `/translate`)

✅ `api/get-pricing.ts` - Edge Function que detecta país
✅ `hooks/usePricing.ts` - Hook React para usar no frontend
✅ `examples/CheckoutExample.tsx` - Exemplo de integração
✅ `README_GATEWAY.md` - Instruções completas

### Integração com Stripe

**1. Setup Inicial:**
- [ ] Criar conta em [stripe.com](https://stripe.com)
- [ ] Verificar conta (pode levar 1-2 dias)
- [ ] Pegar chaves API (Dashboard > Developers > API Keys)

**2. Variáveis de Ambiente:**
```bash
# Adicionar no Vercel
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**3. Edge Function para Stripe:**
```ts
// api/create-stripe-session.ts
// Cria sessão de checkout
// Recebe user_id, retorna redirect URL
```

**4. Webhook para Confirmação:**
```ts
// api/stripe-webhook.ts
// Recebe evento checkout.session.completed
// Atualiza user.is_premium = true no Supabase
```

**5. Modificar CheckoutScreen.tsx:**
```tsx
const { pricing } = usePricing();

if (pricing.gateway === 'stripe') {
  // Chama api/create-stripe-session
  // Redireciona para Stripe Checkout
} else {
  // Código atual do Mercado Pago
}
```

### Custos de Gateway

| Gateway      | Taxa por Transação                  | Recebimento        |
|--------------|-------------------------------------|--------------------|
| Mercado Pago | 4.99% + R$ 0,39                     | Instantâneo (6%) ou D+30 (grátis) |
| Stripe       | 3.4% + R$ 1,09 (internacional)      | D+7 (padrão)       |

**Cálculo Real:**
- Cliente BR paga R$ 67 → Você recebe ~R$ 60 (MP tira ~R$ 7)
- Cliente US paga $67 (R$ 386) → Você recebe ~R$ 368 (Stripe tira ~R$ 18)

---

## 🚀 Estratégia de Lançamento

### Fase 1: Validação Global (Mês 1-2)

**Mercado-alvo:** Estados Unidos
**Canais:**
1. ProductHunt (principal)
2. Reddit (r/ContentCreation, r/SideProject)
3. Twitter/X (com thread mostrando o processo)

**Objetivo:** 100 clientes globais @ US$ 67 = US$ 6.700 (R$ 38.600)

**Preparação:**
- [ ] Landing page 100% em inglês
- [ ] Vídeo demo em inglês (30s)
- [ ] ProductHunt listing (título, descrição, screenshots)
- [ ] Tweet thread pronto (copiar texto)

### Fase 2: Lançamento Brasil (Mês 3-4)

**Mercado-alvo:** Brasil
**Canais:**
1. Influenciadores (micro, 10k-50k seguidores)
2. Ads no Meta (Instagram/Facebook)
3. Reddit Brasil

**Leverage:** "Já usado por 100+ creators nos EUA"

**Objetivo:** 500 clientes BR @ R$ 67 = R$ 33.500

### Timing Recomendado

**Por que EUA primeiro?**
1. Validação rápida (pagam mais, feedback melhor)
2. Social proof ("Usado nos EUA") ajuda no Brasil
3. Receita inicial financia marketing BR

**Por que não simultâneo?**
- Dificulta foco
- Recursos limitados (você é solo)
- Aprende com mercado premium antes do price-sensitive

---

## 🛠️ Implementação Técnica - Checklist Completo

### 1️⃣ Preparação (Antes de Começar)

- [ ] Criar conta Stripe
- [ ] Verificar conta Stripe (1-2 dias úteis)
- [ ] Adicionar variáveis de ambiente no Vercel
- [ ] Fazer backup do código atual (`git branch backup-pre-global`)

### 2️⃣ i18n - Traduções

**Copiar arquivos:**
- [ ] `translate/config/i18n.ts` → `src/i18n.ts` ✅ (já feito)
- [ ] `translate/locales/` → `src/locales/` ✅ (já feito)
- [ ] Importar i18n no `main.tsx` ✅ (já feito)

**Refatorar componentes:**
- [ ] `LandingView.tsx` - Trocar textos fixos por `{t('hero.title')}`
- [ ] `Paywall.tsx` - Trocar textos fixos
- [ ] `CheckoutScreen.tsx` - Trocar textos fixos
- [ ] `Dashboard.tsx` - Trocar textos fixos
- [ ] Testar `/test` (página de teste criada)
- [ ] Testar `/?lng=en` na home

**Traduções adicionais (se necessário):**
- [ ] Emails de boas-vindas (Supabase Auth)
- [ ] Mensagens de erro
- [ ] Notificações

### 3️⃣ Gateway de Pagamento

**Copiar arquivos:**
- [ ] `translate/api/get-pricing.ts` → `api/get-pricing.ts`
- [ ] `translate/hooks/usePricing.ts` → `src/hooks/usePricing.ts`

**Criar Edge Functions:**
- [ ] `api/create-stripe-session.ts` - Cria checkout Stripe
- [ ] `api/stripe-webhook.ts` - Confirma pagamento

**Modificar componentes:**
- [ ] `CheckoutScreen.tsx` - Adicionar lógica dual gateway
- [ ] Testar com VPN (simular IP gringo)

**Configurar Webhook:**
- [ ] Stripe Dashboard > Webhooks > Add endpoint
- [ ] URL: `https://hooky.ai/api/stripe-webhook`
- [ ] Eventos: `checkout.session.completed`

### 4️⃣ Paywall - Degustação Bloqueada

- [ ] Criar componente `BlurredPreview.tsx`
- [ ] Modificar `ProcessingView.tsx` para mostrar preview turvo
- [ ] Adicionar CTA "Desbloqueie por R$ 67/US$ 67" (dinâmico)
- [ ] Testar fluxo completo: gravar → preview → pagar → ver roteiro

### 5️⃣ Testes Finais

**Checkout Brasil:**
- [ ] Gravar áudio → Paywall → Mercado Pago → Confirma pagamento
- [ ] Verificar `is_premium = true` no Supabase
- [ ] Gerar roteiro completo

**Checkout Global:**
- [ ] Usar VPN (US/UK) → Gravar áudio → Stripe
- [ ] Testar cartão de teste Stripe
- [ ] Verificar webhook funciona

**i18n:**
- [ ] `/?lng=en` mostra inglês
- [ ] `/?lng=pt` mostra português
- [ ] Troca de idioma persiste (localStorage)

### 6️⃣ Deploy e Produção

- [ ] Testar em staging primeiro
- [ ] Deploy para produção
- [ ] Monitorar logs (Vercel)
- [ ] Monitorar Stripe Dashboard (transações)
- [ ] Monitorar Supabase (novos usuários premium)

---

## 📈 Métricas de Sucesso

### KPIs Fase 1 (Global - 60 dias)

| Métrica                      | Meta      | Como Medir                     |
|------------------------------|-----------|--------------------------------|
| Clientes pagantes (Global)   | 100       | Stripe Dashboard               |
| Taxa de conversão (Paywall)  | 8%        | Analytics (visitors → paying)  |
| Receita (Global)             | $6.700    | Stripe                         |
| CAC (Custo por Cliente)      | $0-5      | Orgânico (ProductHunt/Reddit)  |

### KPIs Fase 2 (Brasil - 60 dias)

| Métrica                      | Meta      | Como Medir                     |
|------------------------------|-----------|--------------------------------|
| Clientes pagantes (BR)       | 500       | Mercado Pago Dashboard         |
| Taxa de conversão (Paywall)  | 8%        | Analytics                      |
| Receita (BR)                 | R$ 33.500 | Mercado Pago                   |
| CAC                          | R$ 15-20  | Ads + Influenciadores          |

---

## 🚨 Riscos e Mitigações

### Risco 1: IA não funciona bem em inglês
**Impacto:** Alto (produto quebrado)
**Probabilidade:** Média
**Mitigação:** 
- Testar prompt com áudios em inglês ANTES do lançamento
- Ter versão do prompt otimizada para EN
- Pedir feedback de beta testers gringos

### Risco 2: Stripe não aprova conta
**Impacto:** Alto (não consegue vender global)
**Probabilidade:** Baixa
**Mitigação:**
- Aplicar com antecedência (2-3 semanas antes)
- Ter documentos prontos (CPF, comprovante de endereço)
- Alternativa: Lemon Squeezy (mais fácil de aprovar)

### Risco 3: Refatoração introduz bugs
**Impacto:** Médio (app quebra temporariamente)
**Probabilidade:** Média
**Mitigação:**
- Git branch separado para i18n
- Testar cada componente refatorado
- Deploy gradual (staging → produção)

### Risco 4: Conversão do Hard Paywall baixa
**Impacto:** Alto (receita menor que esperado)
**Probabilidade:** Média
**Mitigação:**
- A/B test: Preview turvo vs Trial 3 dias
- Ajustar copy do paywall baseado em feedback
- Oferecer garantia de 7 dias (reduz risco percebido)

### Risco 5: Chargeback alto (Stripe)
**Impacto:** Médio (perde dinheiro + risco de ban)
**Probabilidade:** Baixa
**Mitigação:**
- Descrição clara do produto na landing
- FAQ explicando que é pagamento anual
- Email de boas-vindas reforçando o que foi comprado

---

## 📝 Notas Importantes

### Backend Compartilhado
- **Supabase:** Mesma instância pra BR e Global
- **Tabelas:** Única `users`, `scripts`, `payments`
- **Edge Functions:** Servem ambos os mercados
- Não precisa duplicar infraestrutura

### Domínio
- Manter `hooky.ai` único
- i18n detecta idioma automaticamente
- Opcionalmente: `hooky.com.br` redirect para `hooky.ai/?lng=pt`

### Emails Transacionais
- Supabase Auth já envia em inglês (padrão)
- Customizar templates Supabase para PT/EN
- Ou usar serviço externo (Resend, SendGrid)

### Impostos Internacionais
- Stripe: Coleta info de impostos automaticamente
- Lemon Squeezy: Merchant of Record (eles pagam impostos por você)
- Consultar contador para declarar receita internacional

---

## 🔗 Recursos

### Documentação
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [i18next React](https://react.i18next.com/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

### Ferramentas
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [VPN para testar IP](https://www.tunnelbear.com/)
- [ProductHunt Schedule](https://www.producthunt.com/posts)

### Referências
- Cal.ai (inspiração de landing page)
- AudioPen (concorrente para diferenciar)
- Loom (exemplo de global SaaS B2C)

---

## ✅ Próximos Passos Imediatos

**Quando Retomar:**
1. Ler este documento completo
2. Criar conta Stripe (se ainda não fez)
3. Testar prompt de IA em inglês com áudios reais
4. Começar refatoração i18n pelos componentes críticos
5. Integrar Stripe seguindo `README_GATEWAY.md`

**Antes de Lançar:**
- [ ] Landing page 100% traduzida
- [ ] Checkout funcionando (BR + Global)
- [ ] Preview turvo do roteiro implementado
- [ ] Testar fluxo completo com cartão de teste
- [ ] Preparar materiais de lançamento (ProductHunt)

---

**Última atualização:** 2026-02-07  
**Status:** Preparação completa, aguardando implementação
