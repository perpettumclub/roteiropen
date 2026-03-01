# Chat & Interaction Rules

## 🚨 Protocolo de Confirmação (Estrito)

1.  **Fase "Vague to Specific" (Planning)**:
    - O usuário define o problema.
    - O agente entra em modo **PLANNING**.
    - O agente escreve um **`implementation_plan.md`**.

2.  **Refinamento do Artefato (The Loop)**:
    - O plano descreve *exatamente* o que será feito.
    - O agente usa `notify_user` para pedir revisão.
    - **Regra de Ouro**: NENHUMA execução de código ou comando até o usuário validar o plano.

3.  **Execução (Code Mode)**:
    - Apenas após o "De acordo" do usuário.
    - Agente muda para **EXECUTION** e segue o plano validado.
