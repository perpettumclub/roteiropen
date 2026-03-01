# 🌍 Guia de Internacionalização (i18n) - Hooky

Esta pasta contém toda a estrutura necessária para implementar múltiplos idiomas no Hooky.

## 📁 Estrutura

```
i18n-setup/
├── config/
│   └── i18n.ts          ← Configuração principal do i18next
├── locales/
│   ├── en.json          ← Traduções em Inglês
│   └── pt.json          ← Traduções em Português
├── examples/
│   └── ExampleComponent.tsx  ← Exemplos de uso
└── README.md            ← Você está aqui
```

## 🚀 Como Integrar ao Projeto Principal

### Passo 1: Mover Arquivos

Copie os arquivos para o projeto principal:

```bash
# Mover configuração
cp i18n-setup/config/i18n.ts src/i18n.ts

# Mover traduções
cp -r i18n-setup/locales src/locales
```

### Passo 2: Importar no `main.tsx`

Adicione no **topo** do arquivo `src/main.tsx`:

```typescript
import './i18n'; // ← ADICIONAR ESTA LINHA
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Passo 3: Usar nos Componentes

Importe o hook `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
    </div>
  );
}
```

## 🎯 Como Funciona a Detecção Automática

O i18next **detecta automaticamente** o idioma por:

1. **URL** (`?lng=en` ou `?lng=pt`)
2. **Navegador** (configuração do usuário)
3. **localStorage** (preferência salva)
4. **Fallback** (inglês se nada funcionar)

### Exemplos:

- Usuário com Chrome em português → vê em **Português**
- Usuário com Chrome em inglês → vê em **Inglês**
- URL `hooky.ai?lng=en` → força **Inglês**
- URL `hooky.ai?lng=pt` → força **Português**

## 📝 Adicionar Novas Traduções

Edite os arquivos JSON:

**`src/locales/en.json`:**
```json
{
  "new_section": {
    "title": "My New Title"
  }
}
```

**`src/locales/pt.json`:**
```json
{
  "new_section": {
    "title": "Meu Novo Título"
  }
}
```

Use no componente:
```tsx
{t('new_section.title')}
```

## 🔧 Recursos Avançados

### Interpolação (variáveis)

```tsx
// JSON: "welcome": "Welcome, {{name}}!"
{t('dashboard.welcome', { name: 'João' })}
// Output: "Welcome, João!"
```

### Plural

```tsx
// JSON EN: "streak": "{{count}}-day streak"
// JSON PT: "streak": "Ofensiva de {{count}} dias"
{t('dashboard.streak', { count: 7 })}
```

### Trocar Idioma Manualmente

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
      <button onClick={() => i18n.changeLanguage('pt')}>
        Português
      </button>
    </>
  );
}
```

## 🌐 Adicionar Novo Idioma (Espanhol)

1. Criar `src/locales/es.json`
2. Adicionar em `src/i18n.ts`:

```typescript
import es from './locales/es.json';

i18n.init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es } // ← ADICIONAR
  },
  // ...
});
```

## 📊 Preços Regionais (PPP)

A tradução do **texto** é automática, mas o **preço** precisa de lógica extra.

Crie uma API em `api/get-pricing.ts`:

```typescript
export default async function handler(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') || 'US';
  
  const prices = {
    BR: { amount: 6700, currency: 'BRL', display: 'R$ 67' },
    US: { amount: 6700, currency: 'USD', display: '$67' }
  };
  
  return Response.json(prices[country] || prices.US);
}
```

No componente:
```tsx
const [price, setPrice] = useState(null);

useEffect(() => {
  fetch('/api/get-pricing')
    .then(r => r.json())
    .then(setPrice);
}, []);

return <p>{t('paywall.price_label')}: {price?.display}</p>;
```

## ✅ Checklist de Implementação

- [ ] Mover `i18n.ts` para `src/`
- [ ] Mover `locales/` para `src/`
- [ ] Importar `./i18n` no `main.tsx`
- [ ] Refatorar componente principal (ex: Dashboard)
- [ ] Testar com `?lng=en` e `?lng=pt`
- [ ] Criar API de pricing regional
- [ ] Adicionar switcher de idioma (opcional)
- [ ] Traduzir emails e notificações

## 🐛 Troubleshooting

**Problema:** Textos não mudam
- ✅ Verificar se importou `./i18n` no `main.tsx`
- ✅ Verificar se usou `{t('key')}` e não string hard-coded

**Problema:** Idioma errado
- ✅ Forçar com `?lng=en` na URL
- ✅ Verificar configuração do navegador
- ✅ Limpar localStorage

**Problema:** TypeScript reclama de `t()`
- ✅ Adicionar `"esModuleInterop": true` no `tsconfig.json`

## 📚 Recursos

- [Documentação oficial react-i18next](https://react.i18next.com/)
- [Playground i18next](https://jsfiddle.net/user/i18next/fiddles/)
- [Gerador de traduções com IA](https://openai.com/chatgpt)

---

**Dúvidas?** Veja os exemplos em `examples/ExampleComponent.tsx`
