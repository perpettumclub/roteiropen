# PRE-TASK.md — Checklist Pré-Código

> A IA deve responder estas perguntas em voz alta ANTES de escrever qualquer código.
> Se não conseguir responder alguma → pergunte ao usuário antes de prosseguir.

---

## FASE 1 — Entendimento (responda antes de qualquer coisa)

- [ ] **O que exatamente precisa ser feito?** (descreva em 1-2 frases simples)
- [ ] **O que NÃO está incluído nesta tarefa?** (deixe claro o escopo)
- [ ] **Qual é o critério de sucesso?** (como saberei que está pronto?)
- [ ] **Existe ambiguidade no pedido?** → Se sim, pergunte agora

---

## FASE 2 — Reconhecimento do Projeto

- [ ] Li a estrutura atual de pastas?
- [ ] Existe código similar que posso reutilizar ou estender?
- [ ] Qual padrão de nomenclatura está sendo usado neste projeto?
- [ ] Quais dependências já estão instaladas? (não adicione novas sem verificar)
- [ ] Existe um padrão de tratamento de erro já estabelecido?

---

## FASE 3 — Planejamento (antes de escrever)

- [ ] Onde exatamente vai cada arquivo que vou criar/modificar?
- [ ] Vou duplicar algo que já existe? → Se sim, refatore o existente
- [ ] Alguma das security_rules do architecture.json é relevante aqui?
- [ ] Algum dos hard_limits será ultrapassado com esta implementação?

---

## FASE 4 — Revisão (após escrever)

- [ ] Alguma função tem mais de 30 linhas?
- [ ] Algum arquivo tem mais de 300 linhas?
- [ ] Algum nome de variável/função é genérico?
- [ ] Existe código duplicado ou lógica que poderia ser extraída?
- [ ] Todos os erros são tratados explicitamente?
- [ ] Tem algum dado de usuário sem validação?
- [ ] Tem alguma variável de ambiente hardcoded?
- [ ] Tem algum `console.log` de debug que não deveria ir para produção?
- [ ] O código que escrevi segue os padrões que já existiam no projeto?

---

## GATILHOS DE PARADA — Pare e pergunte se:

🛑 O pedido exigiria acessar o banco direto do frontend  
🛑 O pedido não tem critério claro de sucesso  
🛑 Você precisaria criar uma estrutura de pasta completamente nova  
🛑 Você precisaria adicionar uma dependência pesada (ORM diferente, framework novo)  
🛑 A função/módulo ficaria com mais do que 2 responsabilidades  
🛑 Você não sabe onde colocar o arquivo na estrutura atual  
🛑 O pedido contradiz uma security_rule do architecture.json  
