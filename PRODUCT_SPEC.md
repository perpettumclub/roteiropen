## Hooky – Especificação de Produto (Draft)

### 0. Proposta de valor (landing page)

**Headline / Hero**
- 🔥 AO VIVO – Hooky  
- Transforme ideias bagunçadas em roteiros virais estruturados em segundos.  
- Fale como pensa. Grave como um profissional.  
- CTA principal: **“Gravar Ideia Agora 🎤”**

**Prova social / métrica**
- Exibir contador como “60+ roteiros criados” ou número de criadores que já usam o Hooky.

**Seção “Como a mágica acontece”**
1. **Grave Bagunçado** – o usuário fala qualquer ideia por ~30 segundos, sem estrutura; apenas pensamentos soltos.  
2. **IA Estrutura** – a IA identifica os pontos fortes, cria um hook forte e estrutura o storytelling em ~15 segundos.  
3. **Roteiro Viral** – o usuário recebe um roteiro pronto para Reels/TikTok, com alta chance de retenção.

**Seção “Por que usar o Hooky?”**
- **Velocidade**: de ideia a roteiro em ~15 segundos.  
- **Sem Bloqueios**: elimina o medo da página em branco.  
- **Viralidade**: usa estruturas validadas para prender atenção.  
- **Ferramenta secreta** de criadores que valorizam tempo e buscam viralizar.

### 1. Visão geral
Hooky é uma ferramenta que transforma áudios curtos e desorganizados em roteiros virais para vídeos curtos (Reels, TikTok, Shorts) usando IA.  
O foco é velocidade (de ideia a roteiro em ~15 segundos), estruturas comprovadas de viralidade e eliminação do bloqueio criativo, mantendo recursos extras como onboarding, métricas e gamificação apenas como suporte ao fluxo principal de gravação → roteiro.

### 2. Público-alvo
- Criadores de conteúdo para YouTube Shorts, Reels, TikTok e similares.  
- Pequenos empreendedores e infoprodutores que precisam produzir vídeos com frequência.  
- Usuários com pouca ou média experiência em criação de conteúdo, que buscam orientação prática.

### 3. Objetivos principais do produto
- Ajudar o criador a **gerar roteiros eficazes** e alinhados ao seu perfil.  
- Aumentar a **consistência de postagem** através de lembretes, metas semanais e gamificação.  
- Oferecer um **painel de progresso** simples para visualizar evolução e resultados.  
- Facilitar **monetização / upgrades** via paywall e tela de checkout.

### 4. Fluxos principais

#### 4.1 Autenticação & conta
- Login com e‑mail e senha.  
- Cadastro de novo usuário.  
- Fluxos de:
  - Esqueci minha senha.  
  - Verificação de e‑mail.  
- Após login, o usuário é direcionado para onboarding (se novo) ou para o Dashboard.

#### 4.2 Onboarding (Quiz)
- Usuário responde a um quiz inicial (`QuizFunnel`, `QuizProgress`, `QuizResultScreen`) para:
  - Definir tipo de criador (ex.: “relâmpago”, “viral”, “estrategista”).  
  - Ajustar tom e estilo dos roteiros.  
  - Definir metas iniciais de produção/postagem.
- Ao finalizar, o usuário vê uma tela de resultado com recomendações iniciais.

#### 4.3 Dashboard
- Tela central do produto (`Dashboard`) com:
  - Cabeçalho de boas‑vindas personalizado (ex.: “Olá, Criador ⚡”).  
  - Cartões de estatísticas (scripts criados, dias postando, meta de 60 dias etc.).  
  - Progresso semanal de postagens.  
  - Badges/conquistas do criador.  
  - Gráfico dos últimos dias de postagem.  
  - Desafios diários e sugestões de IA.  
  - Heatmap de atividade de postagem.
- Ações principais:
  - **Criar Roteiro** – leva para o fluxo de criação de script.  
  - **Biblioteca** – abre a biblioteca de scripts salvos.  
  - **Progresso** – mostra visão mais detalhada de histórico e métricas.  
  - **Registrar postagem de hoje** – botões para “Postei” / “Não postei” que atualizam as estatísticas.

#### 4.4 Criação de roteiros (Script)
- Usuário inicia um novo roteiro a partir de:
  - Dashboard (botão “Criar Roteiro”).  
  - Sugestões de IA.  
- Fluxo típico:
  - Inserir tema/idéia de vídeo.  
  - Definir plataforma ou tipo de conteúdo se aplicável.  
  - IA gera o roteiro com estrutura de gancho, desenvolvimento e call‑to‑action.  
  - Usuário pode editar, salvar no script library e, se aplicável, marcar como usado/postado.  
- Tela de output (`ScriptOutput`) mostra o roteiro formatado e pronto para uso.

#### 4.5 Gravação e áudio
- Módulo de gravação (`AudioRecorder`, `AudioVisualizer`):
  - Usuário pode gravar áudio para acompanhar o roteiro.  
  - Visualização de onda/volume em tempo real.  
  - Opção de salvar ou descartar gravações (quando implementado).

#### 4.6 Compartilhamento e crescimento
- Telas de compartilhamento e crescimento (`ShareScreen`, `ShareUnlock`, `GrowthCard`):
  - Compartilhar progresso/estatísticas com amigos ou comunidade.  
  - Possíveis benefícios de indicação/referral (ex.: desbloquear recursos adicionais).  
  - Cards de crescimento que incentivam o usuário a manter consistência.

#### 4.7 Billing e paywall
- `Paywall` e `CheckoutScreen` controlam:
  - Limitação de recursos para plano gratuito (ex.: número de roteiros, acesso a alguns gráficos ou sugestões).  
  - Upgrade para plano pago via checkout (ex.: integração com Mercado Pago / outro provedor).  
  - Após pagamento bem‑sucedido, a conta do usuário é promovida a plano premium.

### 5. Regras de negócio principais
- **Consistência > perfeição**: o produto enfatiza metas de postagem (ex.: 60 dias) e celebra quando o usuário cumpre a meta semanal.  
- **Roteiros personalizados** com base no perfil do criador definido no onboarding.  
- **Limites de uso** para usuários gratuitos (por exemplo, número de roteiros por semana ou funcionalidades bloqueadas atrás do paywall).  
- **Progresso só é atualizado** quando o usuário registra se postou ou não no dia.  
- **Badges** são atribuídos com base em marcos (total de roteiros, dias consecutivos postando etc.).

### 6. Requisitos não funcionais
- Interface responsiva, otimizada para mobile‑first.  
- Tempo de resposta aceitável nas telas principais (< 2–3s nas ações típicas em rede normal).  
- Persistência segura de dados de usuário (autenticação e dados de progresso).  
- Integração com serviços externos (ex.: pagamento, IA, supabase) deve falhar de forma graciosa, exibindo mensagens amigáveis.

### 7. Métricas de sucesso
- Número de roteiros criados por usuário por semana.  
- Número de dias com postagem registrada por usuário (consistência).  
- Taxa de conversão de usuário gratuito para plano pago.  
- Retenção semanal/mensal de usuários ativos.

---

Este documento é um rascunho inicial para consumo por ferramentas como TestSprite e pode ser refinado conforme o produto evolui.

