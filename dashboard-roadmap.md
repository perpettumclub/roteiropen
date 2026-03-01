# Dashboard V2 - Roadmap de Implementação Incremental

> **Estratégia:** Feature por vez. Primeiro front (mock), depois back (persistência).

---

## 🎯 Feature 1: Botões Tinder (Descartei / Postei)

### Front - Mock
- [ ] Adicionar 2 novos botões no Dashboard
- [ ] Criar estado local `useState` para simular posted/discarded
- [ ] Criar modal `MarkAsPostedModal` básico
- [ ] Criar modal `MarkAsDiscardedModal` básico
- [ ] Testar visualmente que botões aparecem
- [ ] Testar que modals abrem/fecham

**Resultado:** Botões funcionam com dados em memória (recarregar = perde dados)

### Back - Persistência
- [ ] Migration: `ADD COLUMN posted_at, posted_platform, discarded`
- [ ] Atualizar função de marcar como postado (salva no Supabase)
- [ ] Atualizar função de marcar como descartado (salva no Supabase)
- [ ] Testar que ao recarregar mantém dados

**Resultado:** Botões salvam no banco e persistem após reload

---

## 🎯 Feature 2: Card "Dias Postando" (Streak)

### Front - Mock
- [ ] Criar hook `usePostingStreak` com dados mockados
- [ ] Atualizar 2º card: "Dias seguidos" → "Dias postando"
- [ ] Usar dados mock (ex: sempre retorna 7)
- [ ] Testar visualmente que card mudou

**Resultado:** Card mostra "7 Dias postando" (valor fixo mock)

### Back - Cálculo Real
- [ ] Atualizar `usePostingStreak` para ler do Supabase
- [ ] Implementar lógica `calculateConsecutiveDays`
- [ ] Testar com dados reais (marcar posts e ver streak mudar)
- [ ] Testar quebra de streak (não postar 2 dias)

**Resultado:** Card mostra streak real calculado do banco

---

## 🎯 Feature 3: Card "Pra Meta 60"

### Front - Mock
- [ ] Atualizar 3º card: "Meta/semana" → "Pra meta 60"
- [ ] Usar cálculo mock: `60 - mockStreak`
- [ ] Testar visualmente que card mudou

**Resultado:** Card mostra "46 Pra meta 60" (baseado em mock)

### Back - Cálculo Real
- [ ] Usar `postingStreak` real do hook
- [ ] Calcular `daysToGoal60 = 60 - postingStreak`
- [ ] Testar que número atualiza quando streak muda

**Resultado:** Card mostra dias faltantes reais para meta 60

---

## 🎯 Feature 4: Meta Semanal (Postagens)

### Front - Mock
- [ ] Atualizar texto: "X roteiros" → "X postagens"
- [ ] Usar contador mock (ex: sempre 3/7)
- [ ] Testar visualmente que texto mudou

**Resultado:** Mostra "3/7 postagens" (valor fixo)

### Back - Contador Real
- [ ] Criar hook `usePostingLog` 
- [ ] Implementar `postsThisWeek` (conta posts últimos 7 dias)
- [ ] Atualizar barra de progresso com valor real
- [ ] Testar que atualiza quando marca post

**Resultado:** Meta semanal mostra posts reais da semana

---

## 🎯 Feature 5: Mini Heatmap (Últimos 7 Dias)

### Front - Mock
- [ ] Criar dados mock de postagens por dia
- [ ] Atualizar heatmap para usar `postingLog` mock
- [ ] Testar visualmente que cores aparecem

**Resultado:** Heatmap mostra dados mock (fixos)

### Back - Dados Reais
- [ ] `usePostingLog` retorna últimos 30 dias
- [ ] Filtrar últimos 7 dias para o mini heatmap
- [ ] Testar que quadradinhos verdes aparecem quando marca post

**Resultado:** Heatmap mostra posts reais dos últimos 7 dias

---

## 🎯 Feature 6: Heatmap Grande (Frequência Criativa)

### Front - Mock
- [ ] Passar `postingLog` mock para `<ActivityHeatmap />`
- [ ] Testar visualmente que heatmap renderiza

**Resultado:** Heatmap grande mostra dados mock

### Back - Dados Reais
- [ ] Passar `postingLog` real para `<ActivityHeatmap />`
- [ ] Testar com 30 dias de dados
- [ ] Verificar que cores refletem densidade de posts

**Resultado:** Heatmap grande mostra histórico real de postagens

---

## 🎯 Feature 7: Sugestões de IA (Adaptadas)

### Front - Mock
- [ ] Criar lógica condicional com dados mock
- [ ] Testar 3 sugestões diferentes baseadas em mock
- [ ] Verificar que textos mudam

**Resultado:** Sugestões mostram textos novos (baseado em mock)

### Back - Lógica Real
- [ ] Usar `postingStreak`, `postsThisWeek` reais
- [ ] Implementar todas as condicionais da tabela
- [ ] Testar que sugestões mudam conforme estado real

**Resultado:** Sugestões refletem situação real do usuário

---

## 🎯 Feature 8: Desafios do Dia (Baseados no Mino)

### Front - Mock
- [ ] Criar array de desafios novos
- [ ] Substituir desafio genérico por um específico
- [ ] Testar que texto mudou

**Resultado:** Mostra desafio novo (ex: "Use um NÚMERO no gancho")

### Back - Rotação de Desafios
- [ ] Implementar lógica de rotação (1 desafio por dia)
- [ ] Salvar no `localStorage` ou backend qual já foi mostrado
- [ ] Testar que desafio muda todo dia

**Resultado:** Desafios rotacionam diariamente

---

## 📊 Ordem Sugerida de Execução

**Semana 1:**
1. ✅ Feature 1: Botões Tinder (Front + Back)
2. ✅ Feature 2: Card "Dias Postando" (Front + Back)

**Semana 2:**
3. ✅ Feature 3: Card "Pra Meta 60" (Front + Back)
4. ✅ Feature 4: Meta Semanal (Front + Back)

**Semana 3:**
5. ✅ Feature 5: Mini Heatmap (Front + Back)
6. ✅ Feature 6: Heatmap Grande (Front + Back)

**Semana 4:**
7. ✅ Feature 7: Sugestões IA (Front + Back)
8. ✅ Feature 8: Desafios Mino (Front + Back)

---

## 🚀 Como Executar Cada Feature

### Template de Execução

**FRONT (Sempre primeiro):**
1. Criar componente/hook com dados MOCKADOS
2. Integrar no Dashboard
3. `npm run dev` e testar visualmente
4. Commit: `feat(dashboard): add [feature] with mock data`

**BACK (Sempre depois):**
1. Migration se necessário
2. Atualizar hook para ler do Supabase
3. Testar que persiste após reload
4. Commit: `feat(dashboard): persist [feature] in database`

---

## ✅ Critérios de Conclusão (Por Feature)

- [ ] Front funciona visualmente
- [ ] Back persiste dados
- [ ] Não quebrou nada existente
- [ ] Commit feito
- [ ] Screenshot/demo pro usuário

---

## 🎯 Próximo Passo

**Começar Feature 1:** Botões Tinder (Descartei/Postei)

**Fase Front:**
1. Adicionar 2 botões no `Dashboard.tsx`
2. Criar `MarkAsPostedModal.tsx` básico
3. Estado local para simular

Quer que eu comece agora pela Feature 1 - Front?
