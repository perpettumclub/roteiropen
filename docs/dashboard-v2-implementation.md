# Dashboard V2 - Plano de Implementação

> **Regra de Ouro:** Manter 100% do design atual, trocar APENAS as métricas.

---

## ✅ Mantém Identico

- Layout e grid atual
- Design flat/minimalista (sem gradientes exagerados)
- Todos os cards e componentes visuais
- **Banner "Ativar lembretes de progresso"** (notification permission)
- Banner "Seu crescimento"
- Heatmap grande "Sua Frequência Criativa"
- Desafio do dia
- Sugestões de IA
- Botão "Gerenciar assinatura" no final
- 4 botões de ação:
  - ⚡ Criar Roteiro (principal)
  - 📚 Biblioteca
  - 📊 Progresso (mantém, não mexer na página)
  - ✅ Postei! (NOVO)
- Badges de conquistas

---

## 🔄 Muda APENAS os Dados

### 1. Cards de Stats (Topo)

```tsx
// ANTES
<div>
  <div>{totalScriptsCreated}</div>
  <div>Roteiros</div>
</div>
<div>
  <div>🔥 {currentStreak}</div>
  <div>Dias seguidos</div>  // baseado em uso do app
</div>
<div>
  <div>🎯 {weeklyGoal}</div>
  <div>Meta/semana</div>
</div>

// DEPOIS
<div>
  <div>{totalScriptsCreated}</div>
  <div>Roteiros</div>  // mantém
</div>
<div>
  <div>🔥 {postingStreak}</div>
  <div>Dias postando</div>  // mudança: agora conta POSTAGENS
</div>
<div>
  <div>🎯 {daysToGoal60}</div>
  <div>Pra meta 60</div>  // mudança: mostra faltam quantos dias pra 60
</div>
```

**Importante:** O terceiro card mostra quantos dias faltam para **completar 60 dias postando**.
- Exemplo: Se está com 14 dias de streak → mostra "46 Pra meta 60"

### 2. Meta Semanal (MANTÉM a seção)

```tsx
// ANTES
<span>Meta Semanal</span>
<span>{scriptsThisWeek}/{weeklyGoal} roteiros</span>

// DEPOIS
<span>Meta Semanal</span>
<span>{postsThisWeek}/7 postagens</span>  // mudança: conta POSTS
```

**Importante:** A seção "Meta Semanal" **continua existindo**, só muda o dado:
- Antes: "3/3 roteiros" 
- Depois: "3/7 postagens"

A meta semanal sempre é 7 (1 post por dia).

### 3. Mini Heatmap (Últimos 7 Dias)

```tsx
// ANTES
const count = activityLog[dateStr] || 0;  // conta roteiros criados

// DEPOIS
const count = postingLog[dateStr] || 0;  // conta vídeos postados
```

### 4. Heatmap Grande (Frequência Criativa)

Mantém o componente `ActivityHeatmap` mas alimenta com dados de **postagem**.

### 5. Desafios

Mantém componente `DailyChallengeCard` mas muda os desafios para:

```tsx
const challenges = [
  {
    id: 'hook-number',
    title: 'Use um número no gancho',
    description: 'Ex: "3 erros que todo criador comete"',
    difficulty: 'FÁCIL'
  },
  {
    id: 'hook-you',
    title: 'Comece o hook com "Você"',
    description: 'Ex: "Você está fazendo isso errado"',
    difficulty: 'FÁCIL'
  },
  {
    id: 'social-proof',
    title: 'Adicione prova social',
    description: 'Ex: "100M de views me ensinaram..."',
    difficulty: 'MÉDIO'
  }
  // ... mais desafios baseados no Mino
];
```

### 6. Botão Novo: "Postei!"

**Adicionar** um quarto botão (não substituir):

```tsx
{/* Action Buttons */}
<div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
  {/* Linha 1: Botões principais */}
  <div style={{ display: 'flex', gap: '1rem' }}>
    <motion.button onClick={onCreateNew} style={{ flex: 2 }}>
      <Zap size={20} /> Criar Roteiro
    </motion.button>

    <motion.button onClick={onViewLibrary} style={{ flex: 1 }}>
      📚 Biblioteca
    </motion.button>

    <motion.button onClick={onViewProgress} style={{ flex: 1 }}>
      <BarChart3 size={18} /> Progresso
    </motion.button>
  </div>

  {/* Linha 2: Botão Postei */}
  <motion.button 
    onClick={() => setShowMarkAsPostedModal(true)}
    style={{ 
      width: '100%',
      background: 'linear-gradient(135deg, #10B981, #34D399)',
      color: 'white'
    }}
  >
    ✅ Marcar como Postado
  </motion.button>
</div>
```

**Layout:**
- Primeira linha: 3 botões (Criar, Biblioteca, Progresso)
- Segunda linha: 1 botão largo (Postei!)

**Importante:** A página de Progresso NÃO será alterada.

---

## 🗄️ Mudanças no Banco

### Migration: Adicionar coluna posted_at

```sql
-- supabase/migrations/XX_add_posting_tracking.sql

ALTER TABLE scripts 
ADD COLUMN posted_at TIMESTAMP,
ADD COLUMN posted_platform TEXT;

-- Criar view para contar postagens
CREATE OR REPLACE VIEW user_posting_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE posted_at IS NOT NULL) as total_posted,
  COUNT(*) FILTER (
    WHERE posted_at >= CURRENT_DATE - INTERVAL '7 days'
  ) as posts_this_week,
  MAX(posted_at) as last_post_date
FROM scripts
GROUP BY user_id;
```

---

## 🪝 Novos Hooks

### usePostingStreak.ts

```typescript
export function usePostingStreak() {
  const { user } = useAuth();
  const [postingStreak, setPostingStreak] = useState(0);
  const [daysToGoal60, setDaysToGoal60] = useState(60);
  
  useEffect(() => {
    if (!user) return;
    
    // Busca scripts com posted_at
    const { data } = await supabase
      .from('scripts')
      .select('posted_at')
      .eq('user_id', user.id)
      .not('posted_at', 'is', null)
      .order('posted_at', { ascending: false });
    
    // Calcula streak de dias consecutivos
    const streak = calculateConsecutiveDays(data);
    setPostingStreak(streak);
    setDaysToGoal60(60 - streak);
  }, [user]);
  
  return { postingStreak, daysToGoal60 };
}
```

### usePostingLog.ts

```typescript
export function usePostingLog() {
  // Similar ao activityLog atual, mas conta postagens
  const { user } = useAuth();
  const [postingLog, setPostingLog] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Busca scripts postados nos últimos 30 dias
    // Agrupa por data
    // Retorna { '2024-02-07': 2, '2024-02-06': 1, ... }
  }, [user]);
  
  return postingLog;
}
```

---

## 🧩 Componente: MarkAsPosted

```tsx
interface MarkAsPostedProps {
  scriptId: string;
  onSuccess: () => void;
}

export function MarkAsPosted({ scriptId, onSuccess }: MarkAsPostedProps) {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | null>(null);
  
  const handleMark = async () => {
    await supabase
      .from('scripts')
      .update({ 
        posted_at: new Date().toISOString(),
        posted_platform: platform 
      })
      .eq('id', scriptId);
    
    onSuccess();
    toast.success('🔥 Postagem registrada! Streak: ' + newStreak);
  };
  
  return (
    <div className="glass-card">
      <h3>Você postou este roteiro?</h3>
      <div>
        <button onClick={() => setPlatform('instagram')}>Instagram</button>
        <button onClick={() => setPlatform('tiktok')}>TikTok</button>
        <button onClick={() => setPlatform('youtube')}>YouTube</button>
      </div>
      <button onClick={handleMark}>Confirmar postagem</button>
    </div>
  );
}
```

---

## 📋 Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Criar migration para `posted_at` e `posted_platform`
- [ ] Testar migration local
- [ ] Deploy migration no Supabase

### 7. Sugestões de IA (Adaptar)

Mantém componente `AISuggestions` mas muda a lógica das sugestões:

```tsx
// ANTES (foco em uso do app)
const suggestions = [
  {
    type: 'greeting',
    message: 'Bom dia, criador!',
    description: 'Manhã é o melhor horário para engajamento'
  },
  {
    type: 'streak',
    message: `Mantenha o fogo! ${currentStreak} dias`,
    description: `Faltam ${daysToNextBadge} dias para o badge "Consistente"`
  },
  {
    type: 'goal',
    message: 'Quase lá!',
    description: `Faltam apenas ${remaining} roteiros para bater sua meta semanal`
  }
];

// DEPOIS (foco em postagem)
const suggestions = [
  {
    type: 'greeting',
    message: 'Bom dia, criador! ☀️',
    description: 'Manhã é o melhor horário para postar'
  },
  {
    type: 'posting-streak',
    message: `Mantenha o fogo! ${postingStreak} dias postando 🔥`,
    description: postingStreak < 7 
      ? `Faltam ${7 - postingStreak} dias para completar a primeira semana!`
      : `Faltam ${60 - postingStreak} dias para a meta de 60 dias`
  },
  {
    type: 'weekly-goal',
    message: postsThisWeek >= 7 ? 'Meta batida! 🎉' : 'Quase lá! 🎯',
    description: postsThisWeek >= 7
      ? 'Você postou todos os dias essa semana!'
      : `Poste mais ${7 - postsThisWeek} vezes para bater a meta semanal`
  },
  {
    type: 'challenge',
    message: 'Já postou hoje? 🎬',
    description: hasPostedToday 
      ? 'Ótimo! Amanhã tem mais!'
      : 'Crie um roteiro e poste para manter o streak'
  }
];
```

**Lógica das sugestões:**

| Condição | Sugestão |
|----------|----------|
| Postou hoje | "🔥 Streak mantido! Amanhã tem mais" |
| Não postou hoje | "Já postou hoje? Crie um roteiro agora" |
| Streak < 7 dias | "Faltam X dias pra primeira semana" |
| Streak 7-59 dias | "Faltam X dias pra meta de 60!" |
| Streak >= 60 | "🏆 Meta alcançada! Mantenha a consistência" |
| Posts semana < 7 | "Faltam X posts pra bater meta semanal" |
| Posts semana = 7 | "🎉 Meta batida! Semana perfeita" |

---

### Fase 2: Hooks e Lógica
