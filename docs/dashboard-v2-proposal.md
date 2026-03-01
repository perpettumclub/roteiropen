# Dashboard V2 - Proposta de Reestruturação

> Mesmo design system, métricas focadas no que importa: **POSTAR**

---

## 🔄 Comparação: Antes vs Depois

### Cards de Stats (Topo)

| ANTES | DEPOIS |
|-------|--------|
| **2** Roteiros | **14** Roteiros criados |
| 🔥 **1** Dias seguidos (uso app) | 🔥 **7** Dias postando |
| 🎯 **3** Meta/semana (roteiros) | 🎯 **46** Dias pra meta 60 |

**Mudança:** 
- "Dias seguidos" agora conta POSTAGENS, não uso do app
- Meta é chegar em 60 dias postando (Mino diz que 60-66 dias cria o hábito)

---

### Banner "Seu Crescimento"

| ANTES | DEPOIS |
|-------|--------|
| "Compartilhe sua evolução" | ✅ Mantém igual |

**Mudança:** Nenhuma. Esse card faz sentido.

---

### Meta Semanal

| ANTES | DEPOIS |
|-------|--------|
| "1/3 roteiros" | "3/7 postagens" |

**Mudança:**
- Foco em POSTAGENS, não roteiros criados
- Meta default: 1 post por dia = 7/semana

---

### Heatmap "Últimos 7 Dias"

| ANTES | DEPOIS |
|-------|--------|
| Mostra ROTEIROS CRIADOS | Mostra VÍDEOS POSTADOS |

**Mudança:**
- Quadradinho verde = dia que POSTOU
- Quadradinho cinza = dia que NÃO postou
- Número dentro = quantos posts naquele dia

**Visual:** Mantém exatamente o mesmo design (quadrados coloridos por dia)

---

### Desafio do Dia

| ANTES | DEPOIS |
|-------|--------|
| "Explorando uma Curiosidade" (genérico) | Desafios baseados no Mino |

**Exemplos de desafios V2:**
- "Use um NÚMERO no seu gancho hoje"
- "Comece com 'Você' no hook"
- "Adicione prova social na primeira frase"
- "Grave um vídeo mostrando sua falha"
- "Faça um hook de 1.5 segundos"

---

### Sugestões para Você

| ANTES | DEPOIS |
|-------|--------|
| "Bom dia, criador!" | ✅ Mantém |
| "Mantenha o fogo! X dias 🔥" | "Você está a X dias da meta de 60!" |
| "Quase lá! Faltam X roteiros" | "Já postou hoje? [Marcar como postado]" |

**Mudança:** Sugestões contextualizam a META DE POSTAGEM

---

### Heatmap Grande "Sua Frequência Criativa"

| ANTES | DEPOIS |
|-------|--------|
| Mostra quando USOU o app | Mostra quando POSTOU |

**Visual:** Mantém o design do heatmap estilo GitHub

---

### Botões de Ação

| ANTES | DEPOIS |
|-------|--------|
| ⚡ Criar Roteiro | ⚡ Criar Roteiro |
| 📚 Biblioteca | 📚 Biblioteca |
| 📊 Progresso | ✅ Marcar Postagem |

**Mudança:** Botão "Progresso" vira "Marcar Postagem" ou adiciona um novo botão

---

## 🆕 Novo Elemento: Tracker de Postagem

Adicionar card simples após criar roteiro:

```
┌───────────────────────────────────────┐
│ 📤 Você postou este roteiro?          │
│                                       │
│ [Instagram]  [TikTok]  [YouTube]      │
│                                       │
│ [ Marcar como postado ]               │
└───────────────────────────────────────┘
```

Quando marca:
- Incrementa contador de streak de POSTAGEM
- Atualiza heatmap
- Dá feedback: "🔥 14 dias postando! Meta 60 → Faltam 46"

---

## 📊 Resumo das Mudanças

### Remove:
- ❌ Streak de USO do app
- ❌ Meta de ROTEIROS por semana
- ❌ Heatmap baseado em USO

### Mantém:
- ✅ Design visual dos cards
- ✅ Estrutura do heatmap
- ✅ Banner "Seu crescimento"
- ✅ Desafio do dia (com conteúdo melhor)
- ✅ Sugestões de IA

### Adapta:
- 🔄 Streak = dias POSTANDO consecutivos
- 🔄 Meta = 60 dias de postagem (ou semanal 7/7)
- 🔄 Heatmap = vídeos POSTADOS, não criados

### Adiciona:
- ➕ Botão "Marcar como postado"
- ➕ Pergunta após criar roteiro: "Postou?"
- ➕ Desafios baseados no framework Mino

---

## 🎯 Por Que Isso Faz Sentido

**Mino diz:**
> "Grave e poste um vídeo por dia durante 60 dias. A consistência cria o padrão neural em 66 dias."

O Dashboard atual gamifica CRIAR roteiro.
Mas o que gera resultado é POSTAR.

**Hooky deve ajudar o creator a:**
1. Criar o roteiro (já faz)
2. Postar consistentemente (NOVO foco)
3. Melhorar a qualidade (desafios)

---

## 💻 Implementação Técnica

### 1. Nova Coluna no Supabase

```sql
ALTER TABLE scripts ADD COLUMN posted_at TIMESTAMP;
ALTER TABLE scripts ADD COLUMN posted_platform TEXT; -- 'instagram', 'tiktok', 'youtube'
```

### 2. Hook usePostingStreak

```ts
// Calcula dias consecutivos com pelo menos 1 script marcado como postado
const { postingStreak, daysToGoal } = usePostingStreak();
```

### 3. Componente MarkAsPosted

```tsx
<MarkAsPosted 
  scriptId={script.id}
  onPosted={() => refetchStats()}
/>
```

### 4. Atualizar Dashboard

Substituir `currentStreak` (baseado em uso) por `postingStreak` (baseado em postagem).

---

## ✅ Próximos Passos

1. [ ] Aprovar proposta
2. [ ] Adicionar coluna `posted_at` no Supabase
3. [ ] Criar hook `usePostingStreak`
4. [ ] Criar componente `MarkAsPosted`
5. [ ] Atualizar Dashboard com novas métricas
6. [ ] Criar novos desafios baseados no Mino
7. [ ] Testar fluxo completo
