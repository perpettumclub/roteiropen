# Estratégia de Paywall e Monetização

## 🎯 Objetivo
Maximizar a conversão imediata (impulso/dopamina) e eliminar custos de infraestrutura com usuários gratuitos (teste grátis).

## 💰 Modelo de Precificação (Definido)
- **Plano:** Anual Único
- **Valor:** R$ 49,90 / ano
- **Trial:** 🚫 SEM período de testes (Remover lógica de 3 dias grátis)
- **Motivo:**
    - O custo de API (OpenAI/Anthropic) para transcrição e geração de roteiros é alto.
    - Evitar "turismo" de usuários que usam o trial, consomem recursos e cancelam.
    - Aproveitar o momento de "dopamina" (hype de influenciador/vídeo) para venda imediata dado o valor baixo (ticket de entrada).

## 🛠️ Mudanças Técnicas Necessárias
1. **Remover Trial:**
   - O usuário cria a conta e cai direto na oferta ou tem acesso bloqueado às features principais.
2. **Design System:**
   - Manter identidade visual atual (Dark/Premium).
   - Não alterar Landing Page, Onboarding ou Signup por enquanto.
3. **Fluxo:**
   - Cadastro -> Paywall R$ 49,90 -> Acesso Liberado.

## 📝 Próximos Passos (Aguardando Aprovação)
- Alterar lógica de `isPremium` para validar apenas pagamentos confirmados.
- Integração com Checkout (Mercado Pago ou similar já configurado) para esse valor específico.
