# Dashboard V2 - Plano Completo

> **Regra de Ouro:** Manter 100% do design atual. Mudar APENAS as métricas de uso → postagem.

---

## 📋 Resumo Executivo

**Problema:** Dashboard atual gamifica USO DO APP, mas o que gera resultado é POSTAR.

**Solução:** Trocar métricas de "uso" por métricas de "postagem".

**Impacto:** Zero mudanças visuais, 100% das mudanças são só nos dados.

---

## ✅ O Que MANTÉM (Design Idêntico)

- [x] Layout e grid atual
- [x] Design flat/minimalista (sem gradientes exagerados)
- [x] Banner "Ativar lembretes de progresso"
- [x] Banner "Seu crescimento"
- [x] Cards de stats (3 cards no topo)
- [x] Seção "Meta Semanal" com barra de progresso
- [x] Mini heatmap (últimos 7 dias)
- [x] Desafio do dia
- [x] Sugestões de IA
- [x] Heatmap grande "Sua Frequência Criativa"
- [x] Badges de conquistas
- [x] 4 botões de ação (3 atuais + 1 novo)
- [x] Botão "Gerenciar assinatura"

**Página de Progresso:** NÃO mexer

---

## 🔄 O Que MUDA (Apenas Dados)

### 1. Cards de Stats (Topo)

| Card | Antes | Depois |
|------|-------|--------|
| 1º | **14** Roteiros | **14** Roteiros ✅ (mantém) |
| 2º | 🔥 **1** Dias seguidos (uso app) | 🔥 **7** Dias postando |
| 3º | 🎯 **3** Meta/semana | 🎯 **46** Pra meta 60 |

**Lógica:**
- 2º card: Conta dias consecutivos com pelo menos 1 vídeo marcado como postado
- 3º card: Mostra `60 - postingStreak` (ex: 7 dias postando = 46 pra meta)

---

### 2. Meta Semanal

**Antes:**
```
Meta Semanal
3/3 roteiros criados
[████████████████████] 100%
```

**Depois:**
```
Meta Semanal
3/7 postagens
[██████░░░░░░░░░░░░░░] 43%
```

**Lógica:** Conta quantos POSTS foram marcados essa semana (sempre meta = 7)

---

### 3. Mini Heatmap (Últimos 7 Dias)

**Antes:** Mostra roteiros CRIADOS  
**Depois:** Mostra vídeos POSTADOS

```tsx
// Mudança no código
const count = activityLog[dateStr] || 0;  // ❌ ANTES
const count = postingLog[dateStr] || 0;   // ✅ DEPOIS
```

**Visual:** Mantém idêntico (quadradinhos coloridos)

---

### 4. Heatmap Grande (Frequência Criativa)

**Antes:** GitHub-style de uso do app  
**Depois:** GitHub-style de postagens

Mantém componente `<ActivityHeatmap />`, só muda a fonte de dados.

---

### 5. Desafios do Dia

**Mantém:** Componente `<DailyChallengeCard />`

**Muda:** Conteúdo dos desafios (baseado no Mino)

| Antes | Depois |
|-------|--------|
| "Explorando uma Curiosidade" | "Use um NÚMERO no gancho" |
| Genérico | "Comece com 'Você' no hook" |
| - | "Adicione prova social: '100M views...'" |

---

### 6. Sugestões de IA

**Mantém:** Componente `<AISuggestions />`

**Muda:** Lógica das sugestões

| Condição | Sugestão |
|----------|----------|
| Postou hoje | "🔥 Streak mantido! Amanhã tem mais" |
| Não postou | "Já postou hoje? Crie um roteiro agora" |
| Streak < 7 | "Faltam X dias pra primeira semana" |
| Streak 7-59 | "Faltam X dias pra meta de 60!" |
| Streak >= 60 | "🏆 Meta alcançada! Mantenha" |
| Posts semana < 7 | "Faltam X posts pra meta semanal" |
| Posts semana = 7 | "🎉 Meta batida! Semana perfeita" |

---

### 7. Botões de Ação

**Antes:** 3 botões em linha horizontal

**Depois:** 3 botões + 2 botões estilo Tinder

```
┌─────────────────────────────────────┐
│ [⚡ Criar Roteiro] [📚] [📊]        │
│ [❌ Descartei] [✅ Postei!]         │
└─────────────────────────────────────┘
```

**Layout:**
- Linha 1: Criar Roteiro (large) + Biblioteca + Progresso
- Linha 2 (estilo Tinder):
  - **❌ Descartei** (vermelho claro, 50% width) - Marca roteiro como descartado
  - **✅ Postei!** (verde, 50% width) - Marca roteiro como postado

**Lógica:**
- Ambos os botões abrem modal para selecionar qual roteiro
- "Descartei" adiciona flag `discarded: true` (não conta pro streak)
- "Postei!" adiciona `posted_at` (conta pro streak)
- Interface familiar tipo swipe

---

## 🗄️ Banco de Dados

### Migration

```sql
-- supabase/migrations/XX_add_posting_tracking.sql

ALTER TABLE scripts 
ADD COLUMN posted_at TIMESTAMP,
ADD COLUMN posted_platform TEXT,
ADD COLUMN discarded BOOLEAN DEFAULT FALSE;

-- Index para performance
CREATE INDEX idx_scripts_posted_at 
ON scripts(user_id, posted_at) 
WHERE posted_at IS NOT NULL;

CREATE INDEX idx_scripts_discarded
ON scripts(user_id, discarded)
WHERE discarded = TRUE;

-- View para estatísticas
CREATE OR REPLACE VIEW user_posting_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE posted_at IS NOT NULL) as total_posted,
  COUNT(*) FILTER (WHERE discarded = TRUE) as total_discarded,
  COUNT(*) FILTER (
    WHERE posted_at >= CURRENT_DATE - INTERVAL '7 days' 
    AND posted_at IS NOT NULL
  ) as posts_this_week,
  MAX(posted_at) as last_post_date
FROM scripts
GROUP BY user_id;
```

---

## 🪝 Novos Hooks

### usePostingStreak.ts

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { supabase } from '../lib/supabase';

export function usePostingStreak() {
  const { user } = useAuth();
  const [postingStreak, setPostingStreak] = useState(0);
  const [daysToGoal60, setDaysToGoal60] = useState(60);
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchStreak() {
      const { data } = await supabase
        .from('scripts')
        .select('posted_at')
        .eq('user_id', user.id)
        .not('posted_at', 'is', null)
        .order('posted_at', { ascending: false });
      
      if (!data || data.length === 0) {
        setPostingStreak(0);
        setDaysToGoal60(60);
        return;
      }
      
      // Calcula streak de dias consecutivos
      const streak = calculateConsecutiveDays(data.map(s => s.posted_at));
      setPostingStreak(streak);
      setDaysToGoal60(Math.max(0, 60 - streak));
    }
    
    fetchStreak();
  }, [user]);
  
  return { postingStreak, daysToGoal60 };
}

function calculateConsecutiveDays(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  // Agrupa por dia (ignora hora)
  const uniqueDays = [...new Set(dates.map(d => 
    new Date(d).toLocaleDateString('en-CA')
  ))].sort().reverse();
  
  // Conta dias consecutivos a partir de hoje ou ontem
  const today = new Date().toLocaleDateString('en-CA');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0; // Quebrou o streak
  }
  
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const current = new Date(uniqueDays[i]);
    const previous = new Date(uniqueDays[i-1]);
    const diffDays = Math.floor((previous.getTime() - current.getTime()) / 86400000);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
```

---

### usePostingLog.ts

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { supabase } from '../lib/supabase';

export function usePostingLog() {
  const { user } = useAuth();
  const [postingLog, setPostingLog] = useState<Record<string, number>>({});
  const [postsThisWeek, setPostsThisWeek] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchLog() {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      
      const { data } = await supabase
        .from('scripts')
        .select('posted_at')
        .eq('user_id', user.id)
        .gte('posted_at', thirtyDaysAgo)
        .not('posted_at', 'is', null);
      
      if (!data) return;
      
      // Agrupa por dia
      const log: Record<string, number> = {};
      data.forEach(script => {
        const dateStr = new Date(script.posted_at).toLocaleDateString('en-CA');
        log[dateStr] = (log[dateStr] || 0) + 1;
      });
      
      setPostingLog(log);
      
      // Conta posts essa semana
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const weekCount = data.filter(s => s.posted_at >= weekAgo).length;
      setPostsThisWeek(weekCount);
    }
    
    fetchLog();
  }, [user]);
  
  return { postingLog, postsThisWeek };
}
```

---

## 🧩 Componente: MarkAsPostedModal

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Instagram, Music, Youtube } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface MarkAsPostedModalProps {
  scriptId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkAsPostedModal({ scriptId, onClose, onSuccess }: MarkAsPostedModalProps) {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleMark = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Se tem scriptId específico, marca ele
      if (scriptId) {
        await supabase
          .from('scripts')
          .update({ 
            posted_at: new Date().toISOString(),
            posted_platform: platform 
          })
          .eq('id', scriptId);
      } else {
        // Senão, pega o último script não marcado
        const { data: scripts } = await supabase
          .from('scripts')
          .select('id')
          .eq('user_id', user.id)
          .is('posted_at', null)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (scripts && scripts[0]) {
          await supabase
            .from('scripts')
            .update({ 
              posted_at: new Date().toISOString(),
              posted_platform: platform 
            })
            .eq('id', scripts[0].id);
        }
      }
      
      onSuccess();
      
      // Feedback visual
      const newStreak = calculateNewStreak(); // implementar
      alert(`🔥 Postagem registrada! Streak: ${newStreak} dias`);
      
      onClose();
    } catch (error) {
      console.error('Erro ao marcar postagem:', error);
      alert('Erro ao registrar postagem');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card"
        style={{
          padding: '2rem',
          borderRadius: '24px',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Marcar como Postado</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
          Em qual plataforma você postou?
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setPlatform('instagram')}
            style={{
              flex: 1,
              padding: '1rem',
              border: platform === 'instagram' ? '2px solid #E1306C' : '2px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              background: platform === 'instagram' ? 'rgba(225,48,108,0.1)' : 'white',
              cursor: 'pointer'
            }}
          >
            <Instagram size={24} />
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Instagram</div>
          </button>
          
          <button
            onClick={() => setPlatform('tiktok')}
            style={{
              flex: 1,
              padding: '1rem',
              border: platform === 'tiktok' ? '2px solid #000' : '2px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              background: platform === 'tiktok' ? 'rgba(0,0,0,0.05)' : 'white',
              cursor: 'pointer'
            }}
          >
            <Music size={24} />
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>TikTok</div>
          </button>
          
          <button
            onClick={() => setPlatform('youtube')}
            style={{
              flex: 1,
              padding: '1rem',
              border: platform === 'youtube' ? '2px solid #FF0000' : '2px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              background: platform === 'youtube' ? 'rgba(255,0,0,0.05)' : 'white',
              cursor: 'pointer'
            }}
          >
            <Youtube size={24} />
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>YouTube</div>
          </button>
        </div>
        
        <button
          onClick={handleMark}
          disabled={!platform || loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: platform && !loading ? '#10B981' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: platform && !loading ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Registrando...' : '✅ Confirmar Postagem'}
        </button>
      </motion.div>
    </div>
  );
}
```

---

## 📝 Checklist de Implementação

### Fase 1: Preparação
- [ ] Revisar e aprovar este documento
- [ ] Fazer backup do Dashboard.tsx atual
- [ ] Criar branch `feature/dashboard-v2`

### Fase 2: Banco de Dados
- [ ] Criar migration `XX_add_posting_tracking.sql`
- [ ] Testar migration localmente
- [ ] Deploy migration no Supabase produção
- [ ] Verificar índices criados

### Fase 3: Hooks e Lógica
- [ ] Criar `src/hooks/usePostingStreak.ts`
- [ ] Criar `src/hooks/usePostingLog.ts`
- [ ] Testar hooks com dados mockados
- [ ] Integrar hooks no Dashboard

### Fase 4: Componentes
- [ ] Criar `src/features/posting/MarkAsPostedModal.tsx`
- [ ] Atualizar `Dashboard.tsx` - Cards de stats
- [ ] Atualizar `Dashboard.tsx` - Meta semanal
- [ ] Atualizar `Dashboard.tsx` - Heatmaps
- [ ] Atualizar `Dashboard.tsx` - Botões
- [ ] Adaptar `DailyChallengeCard` com novos desafios
- [ ] Adaptar `AISuggestions` com nova lógica

### Fase 5: Testes
- [ ] Testar criação de roteiro
- [ ] Testar marcar como postado
- [ ] Verificar streak incrementa corretamente
- [ ] Verificar meta semanal atualiza
- [ ] Verificar heatmaps atualizam
- [ ] Testar quebra de streak (não postar 2 dias)
- [ ] Testar com usuário novo (0 posts)
- [ ] Testar com usuário que já tem streak alto

### Fase 6: Deploy
- [ ] Merge para main
- [ ] Deploy para produção
- [ ] Monitorar erros (Sentry/logs)
- [ ] Pedir feedback dos usuários

---

## 🎯 Resultado Esperado

**Dashboard atual:**
- Gamifica uso do app
- Meta de roteiros criados
- Não importa se o creator posta ou não

**Dashboard V2:**
- Gamifica POSTAGEM de vídeos
- Meta de 60 dias postando (+ meta semanal 7 posts)
- Alinhado com framework do Mino
- Incentiva o que realmente gera resultado

---

## ⚠️ Avisos Importantes

1. **NÃO mexer na página de Progresso**
2. **NÃO alterar design visual** (mantém flat/minimalista)
3. **NÃO quebrar funcionalidades existentes** (badges, notificações, etc)
4. **Testar bem antes de deployar**
5. **Fazer backup antes de começar**

---

**Última atualização:** 2026-02-07  
**Status:** Aguardando aprovação para implementação
