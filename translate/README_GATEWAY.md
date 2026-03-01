# 💳 Gateway Duplo: Brasil + Global

Este guia explica como usar Mercado Pago (Brasil) e Stripe (Resto do Mundo) no mesmo app.

---

## 📌 Como Funciona (Explicação Simples)

```
Usuário acessa hooky.ai
        ↓
Sistema detecta país pelo IP
        ↓
┌──────────────────────────────────────┐
│   É do Brasil?                       │
│   ├── SIM → Mercado Pago (R$ 67)     │
│   └── NÃO → Stripe ($67)             │
└──────────────────────────────────────┘
```

O usuário **nem sabe** que existem 2 gateways. Ele só vê o checkout certo pro país dele.

---

## 📁 Arquivos Criados

```
translate/
├── api/
│   └── get-pricing.ts    ← Detecta país e retorna gateway
├── hooks/
│   └── usePricing.ts     ← Usa no React
└── examples/
    └── CheckoutExample.tsx
```

---

## 🚀 Como Ativar (Passo a Passo)

### Passo 1: Copiar a API

Copie o arquivo `api/get-pricing.ts` para a pasta `api/` na raiz do projeto:

```
roteiropen/
├── api/                      ← Pasta das Edge Functions
│   ├── get-pricing.ts        ← COLE AQUI
│   └── (outros arquivos...)
```

### Passo 2: Copiar o Hook

Copie `hooks/usePricing.ts` para `src/hooks/`:

```
roteiropen/
├── src/
│   ├── hooks/
│   │   └── usePricing.ts    ← COLE AQUI
```

### Passo 3: Configurar Stripe

1. Crie conta em [stripe.com](https://stripe.com)
2. Pegue as chaves em "Developers > API Keys"
3. Adicione no Vercel:

```
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

### Passo 4: Usar no Checkout

No seu `CheckoutScreen.tsx`, adicione:

```tsx
import { usePricing } from '@/hooks/usePricing';

function CheckoutScreen() {
  const { pricing, loading } = usePricing();
  
  // Mostra preço dinâmico
  <span>{pricing.displayPrice}</span>
  
  // Usa gateway certo
  if (pricing.gateway === 'stripe') {
    // Código do Stripe
  } else {
    // Seu código atual do Mercado Pago
  }
}
```

---

## 💰 Tabela de Preços

| País   | Gateway      | Preço  | Moeda |
|--------|--------------|--------|-------|
| Brasil | Mercado Pago | R$ 67  | BRL   |
| Outros | Stripe       | $67    | USD   |

---

## ❓ Perguntas Frequentes

### "Preciso de CNPJ pro Stripe?"
Não. Pessoa física pode usar. Você recebe em conta brasileira (PJ ou PF).

### "Stripe tem Pix?"
Não. Stripe só aceita cartão.

### "E se o IP estiver errado?"
Raro, mas pode acontecer. O usuário pode trocar de gateway manualmente (futura implementação).

### "Quanto custa o Stripe?"
3.4% + R$ 1,09 por transação internacional.

---

## 🔧 Testando Localmente

Como você está no Brasil, a API sempre vai retornar `mercadopago`.

Para simular gringo, use esta versão de teste:

```ts
// api/get-pricing.ts (temporário para teste)
const country = request.headers.get('x-vercel-ip-country') || 'US';

// Força Stripe para teste:
// const country = 'US';
```

Depois do teste, remova a linha forçada.

---

## ✅ Checklist de Ativação

- [ ] Criar conta Stripe
- [ ] Adicionar chaves no Vercel
- [ ] Copiar `api/get-pricing.ts` para `/api/`
- [ ] Copiar `hooks/usePricing.ts` para `/src/hooks/`
- [ ] Integrar no `CheckoutScreen.tsx`
- [ ] Testar com VPN (simular outro país)
- [ ] Deploy

---

Pronto! Qualquer dúvida, me chama.
