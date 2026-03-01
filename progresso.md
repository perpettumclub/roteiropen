# 📊 Progresso.md - A Constituição da Página de Progresso

Este arquivo é a **verdade absoluta** sobre a página `ProgressScreen.tsx` e suas funcionalidades (`UserContext`, `Goals`, `Metrics`).
**Regra 0:** Antes de qualquer alteração na página de progresso, LEIA este arquivo.

## 🎯 Objetivo da Página
Ser o painel de gamificação do usuário, onde ele vê seu crescimento real, define metas e é recompensado visualmente.

## 📜 Regras de Ouro (Não Quebrar)
1.  **Zero Mock:** Nenhum dado pode ser falso. Tudo deve vir do Supabase (`user_goals`, `social_metrics`).
2.  **Persistência Real:** Se o usuário der F5, o gráfico, a meta e os badges devem continuar lá.
3.  **Gamificação Infinita:** Ao bater uma meta, o sistema DEVE oferecer a próxima imediatamente (10k -> 25k -> 50k).
4.  **Feedback Visual:** Uploads de imagem devem ter preview imediato. Metas batidas devem ter confetes.

## ✅ Funcionalidades Implementadas (Estado Atual)
- [x] **Gráfico de Área (Wavy):** Visual style "Stripe", com degradê.
- [x] **Upload Invisível:** Imagens vão para o bucket `progress-photos`, mas não poluem a tela com galeria.
- [x] **Metas Persistentes:** Tabela `user_goals` criada e integrada.
- [x] **Modal de Level Up:** Confetes + Sugestão automática de próximo tier.
- [x] **Correção de Upload:** "Registrar Métricas" mostra o preview da imagem corretamente.

## � Fluxo de Upload de Prints (OCR)

### Como Funciona
1.  **Usuário clica no botão "Enviar Prints"** no modal de métricas.
2.  **Seleciona 2 imagens:**
    *   Print do **Perfil do Instagram** (mostra seguidores, seguindo, posts).
    *   Print da **Tela de Insights** (mostra alcance, engajamento, views, likes no período).
3.  **Clica em "Processar Imagens".**
4.  **Backend envia para GPT-4 Vision (OpenAI)** que faz OCR e extrai os dados em formato JSON:
    ```json
    {
      // Do Print de Perfil:
      "seguidores": 8542,
      "seguindo": 312,
      "posts": 87,
      
      // Do Print de Insights (OBRIGATÓRIO):
      "contas_alcancadas": 15200,
      "contas_com_engajamento": 1280,
      "impressoes": 42000,
      "interacoes": 2150,
      "cliques_site": 89,
      "cliques_email": 12,
      "visitas_perfil": 340,
      "saves": 156,
      "shares": 78,
      "likes_periodo": 1850,
      "comentarios_periodo": 245,
      
      // Calculado automaticamente:
      "engajamento_percent": 8.42  // (interacoes / contas_alcancadas) * 100
    }
    ```
5.  **Dados são salvos na tabela `social_metrics`** (Supabase) com `user_id` e `created_at`.
6.  **Dashboard atualiza automaticamente:**
    *   Container **Seguidores:** Mostra valor atual (ex: 8.542).
    *   Container **Engajamento:** Mostra % (ex: 4.2%).
    *   Container **Meta:** Compara `seguidores` atual vs. `user_goals.target_value`.
        *   Ex: Meta = 10.000. Atual = 8.542. Exibe: "Faltam **1.458** para sua meta!"

### Regras de Implementação
*   O OCR **NÃO pode inventar dados.** Se a imagem estiver ilegível, retornar erro amigável.
*   Os dados devem ser **persistidos no Supabase** para histórico e gráfico de evolução.
*   O modal deve mostrar **preview das imagens** antes de processar.

---

## 📦 Os 3 Containers Principais

> **REGRA CRÍTICA:** Todos os dados vêm do **Supabase**, nunca do `localStorage`. Se o usuário ficar 2 dias sem acessar e voltar, os dados **DEVEM** estar lá. Zero dado mockado.

### 1. Container Seguidores
*   **Fonte:** Último registro da tabela `social_metrics` (campo `seguidores`).
*   **Comportamento:** Mostra o número de seguidores do **print mais recente** que o usuário enviou.
*   **Estado vazio:** Se nunca enviou print, exibir mensagem: *"Envie seu primeiro print para começar!"* (não mostrar 0).

### 2. Container Engajamento
*   **Fonte:** Campos extraídos do **print de Insights** via OCR (NÃO de input manual!).
*   **Dados utilizados:**
    *   `contas_alcancadas` (Alcance)
    *   `contas_com_engajamento`
    *   `interacoes` (likes + comentários + saves + shares)
    *   `impressoes`
    *   `cliques_site`, `visitas_perfil`
*   **Cálculo do %:** `(interacoes / contas_alcancadas) * 100`
*   **Comportamento:** Mostra % atual + indicador 📈📉 comparando com registro anterior.

> ⚠️ **ERRO ATUAL:** O sistema pede input manual (média de likes, etc). Isso está **ERRADO**. Todos os dados devem vir automaticamente do OCR do print de Insights.

### 3. Container Meta
*   **Fonte:** Tabela `user_goals` (campo `target_value`) + `social_metrics` (campo `seguidores`).
*   **Comportamento:**
    1.  Usuário define meta no **modal "Definir Meta"** (ex: 10.000 seguidores).
    2.  Sistema compara `target_value` com `seguidores` do último print.
    3.  Exibe: *"Faltam X para sua meta!"* ou *"🎉 Meta batida!"* (dispara confetes + modal Level Up).
*   **Barra de progresso:** Deve preencher proporcionalmente (ex: 8.542/10.000 = 85.42%).

### 4. Container Crescimento (Gráfico de Ondas)
*   **Fonte:** **TODOS os registros** da tabela `social_metrics` ordenados por `created_at`.
*   **Comportamento:**
    1.  Cada vez que o usuário envia um novo print, um **novo ponto** é adicionado ao gráfico.
    2.  O eixo X = datas dos uploads (ex: 28/Jan, 04/Fev, 11/Fev...).
    3.  O eixo Y = número de seguidores em cada data.
*   **Exemplo prático:**
    *   28/Jan → 4.700 seguidores (1º print).
    *   04/Fev → 5.043 seguidores (2º print).
    *   O gráfico mostra uma **curva ascendente** de 4.700 para 5.043.
*   **Visual:** Gráfico de área "wavy" estilo Stripe, com degradê roxo/azul.
*   **Estado vazio:** Se só tem 1 registro, mostrar apenas um ponto com mensagem: *"Envie mais prints para ver sua evolução!"*

### 5. Container Registros
*   **Fonte:** Contagem de registros (`COUNT(*)`) na tabela `social_metrics` por `user_id`.
*   **Comportamento:** Mostra quantas vezes o usuário já enviou prints (ex: "5 registros").
*   **Gamificação futura:** Pode virar badge ("📸 5 prints enviados!").

> **PERSISTÊNCIA OBRIGATÓRIA:** Todos os pontos do gráfico e métricas ficam **gravados no Supabase**. Se a pessoa ficar 1 mês sem acessar e voltar, o histórico completo continua lá.

---

## 🎯 Modal "Definir Meta"

### Campos do Modal
1.  **Meta de Seguidores:** Input numérico (ex: 10.000).
2.  **Prazo (Deadline):** Date picker para escolher a data limite (ex: 28/02/2026).

### Fluxo
1.  Usuário clica no botão **"Definir Meta"**.
2.  Preenche a meta (ex: 10.000 seguidores) e o prazo (ex: 28/Fev).
3.  Clica em **"Salvar"**.
4.  Dados são gravados na tabela `user_goals`:
    ```json
    {
      "user_id": "uuid-do-usuario",
      "target_value": 10000,
      "deadline": "2026-02-28",
      "created_at": "2026-01-28T13:15:00Z"
    }
    ```
5.  Container Meta atualiza automaticamente:
    *   Mostra: **Meta: 10.000** | **Atual: 5.000** | **50% concluído**.
    *   Barra de progresso preenche 50%.
    *   Exibe: *"Faltam 31 dias para sua meta!"* (countdown baseado no `deadline`).

### Regras de Persistência

> ⚠️ **REGRA INQUEBRÁVEL:** Metas ficam **PERMANENTEMENTE** no Supabase.

*   Se o usuário ficar **6 meses** sem acessar e voltar, a meta **DEVE** aparecer exatamente como foi definida.
*   Os dados **NÃO podem ficar só no `localStorage`** — isso é volátil e se perde.
*   Ao carregar a página, o app faz `SELECT * FROM user_goals WHERE user_id = X` e popula o container.
*   **Nenhum dado pode sumir.** Se foi registrado, fica gravado para sempre (ou até o usuário deletar manualmente).

---

## 📧 Sistema de E-mails Automatizados

### 1. E-mail de Confirmação de Upload
*   **Trigger:** Usuário envia prints e dados são processados com sucesso.
*   **Assunto:** "✅ Seu dashboard de progresso foi atualizado!"
*   **Conteúdo:** Confirma que os dados foram salvos, mostra resumo (seguidores atuais, engajamento, % da meta).

### 2. E-mail de Proximidade da Meta
*   **Trigger:** `seguidores` >= 90% de `target_value` (ex: meta 10k, usuário chegou em 9k).
*   **Assunto:** "🔥 Você está quase lá! Faltam apenas X seguidores!"
*   **Conteúdo:** Encoraja a continuar, lembra de postar roteiros virais, convida a atualizar o dashboard.

### 3. E-mail de Meta Alcançada 🎉
*   **Trigger:** `seguidores` >= `target_value`.
*   **Assunto:** "🏆 PARABÉNS! Você alcançou sua meta de X seguidores!"
*   **Conteúdo:** Celebra a conquista, mostra estatísticas, sugere próxima meta (10k → 25k → 50k → 100k).

### 4. E-mails de Reengajamento (Inatividade)

| Dias sem usar | Assunto | Tom |
|---------------|---------|-----|
| **7 dias** | "👀 Sentimos sua falta! Seu progresso está te esperando" | Leve, amigável |
| **15 dias** | "⚠️ Sua consistência está em risco..." | Urgência moderada |
| **30 dias** | "🚨 Não deixe seu sonho esfriar. Volte agora." | Direto, honesto |

*   **Lógica:** Calcular `DAYS_SINCE(last_login)` ou `DAYS_SINCE(last_social_metrics_upload)`.
*   **Conteúdo:** Lembrar que consistência é a chave, mostrar o que está perdendo (streak, progresso), CTA para voltar ao app.

### Implementação Técnica
*   **Serviço:** Resend, SendGrid ou Supabase Edge Functions + SMTP.
*   **Tabela auxiliar:** `email_logs` para rastrear quais e-mails já foram enviados (evitar spam).
*   **Cron Job:** Verificar diariamente usuários inativos e disparar e-mails de reengajamento.

---

## 🔒 Garantias de Persistência (CRÍTICO)

> **REGRA ABSOLUTA:** ZERO dados em `localStorage`. TUDO no Supabase.

### Tabelas de Persistência

| Dado | Tabela Supabase | Campo Chave | Persistência |
|------|-----------------|-------------|--------------|
| Métricas OCR (seguidores, engajamento, etc.) | `social_metrics` | `user_id`, `date` | ✅ Permanente |
| Meta de seguidores | `user_goals` | `user_id` | ✅ Permanente |
| Data limite da meta | `user_goals` | `target_date` | ✅ Permanente |
| Screenshots enviados | `user_screenshots` + Storage | `user_id` | ✅ Permanente |
| E-mails enviados | `email_logs` | `user_id`, `email_type` | ✅ Permanente |

### Fluxo de Dados Verificado

```
1. Upload Print → processImages()
2. GPT-4 Vision OCR → Extrai 15+ campos
3. saveMetric() → INSERT/UPSERT em social_metrics
4. loadMetrics() → SELECT com user_id filter
5. Dashboard renderiza → Dados do state (alimentado pelo Supabase)
```

### Checklist de Verificação

- [x] F5 (refresh) mantém todos os dados
- [x] Logout/Login mantém dados
- [x] Outro navegador mostra mesmos dados (mesmo user_id)
- [x] Outro dispositivo mostra mesmos dados
- [x] Dados persistem após dias/semanas/meses
- [x] Gráfico de crescimento usa dados históricos do Supabase
- [x] Meta e countdown usam user_goals do Supabase

### RLS (Row Level Security)

Todas as tabelas possuem políticas RLS:
- `social_metrics`: Usuário só vê seus próprios dados
- `user_goals`: Usuário só vê/edita sua própria meta
- `email_logs`: Usuário só vê seus próprios logs

---

*Última atualização: 28/01/2026 - Implementação completa de Persistência*
