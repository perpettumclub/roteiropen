# 💫 Quote Card - Feature de Compartilhamento Viral

## Conceito
Gerar uma imagem compartilhável com o **hook do roteiro criado**, para o usuário postar nos Stories e gerar viralização orgânica.

---

## 🎯 Objetivo
Criar um **viral loop**: usuário cria roteiro → compartilha → seguidores veem → baixam o app → criam roteiro → compartilham...

---

## 📱 Elementos do Quote Card

| Elemento | Descrição |
|----------|-----------|
| **Hook em destaque** | O gancho do roteiro gerado, texto grande e impactante |
| **Branding Hooky** | Logo (estrela amarela) + "Criado com Hooky" |
| **Background** | Gradiente amarelo/coral ou customizável |
| **CTA sutil** | "Crie seu roteiro viral →" ou similar |

---

## 🔄 User Flow

```
Usuário cria roteiro 
    → Vê resultado 
    → Clica "Compartilhar nos Stories" 
    → App gera imagem PNG do Quote Card 
    → Abre share sheet nativo
    → Pessoa posta no Instagram/WhatsApp
    → Seguidores veem e perguntam "o que é Hooky?"
    → Download do app
```

---

## 🎨 Design Specs

### Formato
- **Dimensões**: 1080x1920 (9:16, formato Story)
- **Formato**: PNG com transparência opcional

### Estilo Visual
- Card branco flutuante com sombra suave
- Bordas arredondadas (24px)
- Tipografia: fonte display para o hook
- Logo Hooky pequeno no rodapé do card

### Variações
1. **Clean**: Fundo gradiente + card branco
2. **Glassmorphism**: Card semi-transparente sobre foto do usuário
3. **Dark mode**: Card escuro para quem prefere

---

## 🛠️ Implementação Técnica

### Dependência sugerida
```bash
npm install html-to-image
# ou
npm install dom-to-image
```

### Componente
```tsx
// src/components/QuoteCard.tsx
// Gera imagem do hook para compartilhamento
```

### Funcionalidades
- [ ] Componente visual do card
- [ ] Função para converter DOM → imagem PNG
- [ ] Share sheet nativo (Web Share API)
- [ ] Fallback: download da imagem se share não disponível

---

## 📊 Métricas de Sucesso

- **Shares por usuário**: quantos compartilham após criar roteiro
- **Downloads via share**: tracking de origem (UTM ou deep link)
- **Conversão**: % de quem vê → baixa → cria roteiro

---

## 🔗 Referências

- **Hunter Isaacson (NGL)**: Viral loops e re-download através de compartilhamento
- **Cal.ai**: Screenshot do resultado como marketing gratuito
- **Superwall**: Monetização + viralização integradas

---

## Status: 📋 Backlog
*Criado em: 14/12/2024*
