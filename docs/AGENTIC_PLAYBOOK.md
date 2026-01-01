# RoteiroPen Agentic Playbook 🤖🏗️

Este playbook define o fluxo de trabalho entre o **Arquiteto** (Você) e o **Construtor** (Agente AI/Antigravity), baseado no método "Agentic Workflow".

## 1. Os Papéis (Roles)

### 🎩 O Arquiteto (Você - User)
*   **Foco:** O "O Que" e o "Porquê". Lógica de alto nível, regras de negócio, restrições de segurança e experiência do usuário.
*   **Entregável:** A **Spec Sheet** (Folha de Especificação/Prompt).
*   **Ação:** Revisa planos, aprova mudanças críticas e realiza o Teste de Aceitação Final.
*   **Mindset:** "Não coloque tijolos, desenhe a planta."

### 👷 O Construtor (Agente - Eu)
*   **Foco:** O "Como". Detalhes de implementação, sintaxe, escolha de bibliotecas, tratamento de erros e execução de testes.
*   **Entregável:** Código funcional, Planos de Implementação e Evidências de Teste.
*   **Ação:** Planeja, Codifica, Refatora e Verifica. Autonomamente corrige erros de build/lint.

---

## 2. O Fluxo de Trabalho (The Workflow)

### Fase 1: O Blueprint (A Spec Sheet)
Em vez de pedir "crie um botão", forneça o contexto completo.

**Template de Spec Sheet (Copie e use):**
> **Missão:** [Resumo em uma frase, ex: Criar sistema de convites para equipe]
> **Contexto:** [Por que isso é necessário? Quem vai usar?]
> **Requisitos Funcionais:**
> *   [O usuário deve poder fazer X]
> *   [O sistema deve validar Y]
> **Restrições Técnicas (Constraints):**
> *   [Use Tailwind para estilização]
> *   [Não salvar dados sensíveis no LocalStorage]
> *   [Usar componentes existentes da pasta `src/shared/ui`]

### Fase 2: O Planejamento (Planning)
O Agente cria ou atualiza o `implementation_plan.md`.
*   **Trabalho do Arquiteto:** Ler o plano.
    *   *Se o plano estiver errado:* Peça para revisar **antes** de qualquer código ser escrito.
    *   *Se estiver certo:* Dê o "De acordo" (LGTM).

### Fase 3: Execução & Auto-Correção
O Agente escreve o código e corrige seus próprios erros imediatos (linting, imports, tipos).
*   **Trabalho do Arquiteto:** Pausa para o café ☕. Não microgerencie erros de terminal a menos que o Agente peça ajuda ou trave.

### Fase 4: Verificação
O Agente testa o caminho feliz e casos de borda.
*   **Trabalho do Arquiteto:** Validar se o resultado final atende à Spec Sheet original.

---

## 3. Regras de Ouro do RoteiroPen (Project Standards)

1.  **Tech Stack:**
    *   Frontend: React + Vite + Typescript + TailwindCSS.
    *   Backend: Node.js (Express) ou Serverless Functions (se aplicável).
    *   DB/Auth: Supabase.
2.  **Segurança:**
    *   Nunca comitar chaves de API (`.env` apenas local).
    *   Validação sempre no Backend (ou Edge), nunca confiar apenas no Frontend.
3.  **Código Limpo:**
    *   Componentes pequenos e funcionais.
    *   "Architect" define a estrutura, "Builder" implementa a sintaxe.

---
*Este documento serve como guia para manter a eficiência do desenvolvimento assistido por IA.*
