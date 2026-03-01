# Senior Dev Kit — Anti-Vibe-Coding

Kit de arquivos para fazer a IA se comportar como um desenvolvedor sênior de 20 anos,  
não como um estagiário animado que nunca vai dar manutenção no código.

---

## O PROBLEMA QUE ESTE KIT RESOLVE

Pesquisas de 2026 mostram que projetos com vibe coding têm:
- Duplicação de código 4x acima do normal
- "Slop layer" — código que funciona mas ninguém entende
- Falhas graves de segurança (DB linkado direto no frontend, etc.)
- Dívida técnica que cresce exponencialmente e paralisa o projeto

A causa raiz: a IA não tem opinião própria e sempre concorda com você.  
Este kit dá à IA **restrições explícitas** que simulam o julgamento de um sênior.

---

## ARQUIVOS DO KIT

| Arquivo | Para quê serve | Onde colocar |
|---|---|---|
| `CLAUDE.md` | Regras gerais de comportamento da IA | Raiz do projeto |
| `architecture.json` | Estrutura de pastas e convenções do projeto | Raiz do projeto |
| `PRE-TASK.md` | Checklist que a IA deve responder antes de codificar | Raiz do projeto |
| `SKILL-SECURITY.md` | Regras de segurança com exemplos | Raiz do projeto |
| `SKILL-NO-DUPLICATION.md` | Como identificar e evitar duplicação | Raiz do projeto |
| `SKILL-MAINTAINABILITY.md` | Como escrever código que sobrevive ao tempo | Raiz do projeto |

---

## COMO USAR

### Projeto Novo (recomendado)
```bash
# 1. Copie todos os arquivos para a raiz do projeto
cp senior-dev-kit/* meu-projeto/

# 2. Edite architecture.json com as informações do seu projeto
#    (nome, tipo, linguagem, etc.)

# 3. Na sua primeira mensagem para a IA, inclua:
"Leia o CLAUDE.md, architecture.json e PRE-TASK.md antes de qualquer coisa"

# 4. Para tarefas específicas, mencione os skills relevantes:
"Aplicando SKILL-SECURITY.md, crie o endpoint de login"
```

### Projeto Existente
```bash
# 1. Copie os arquivos para a raiz
# 2. Edite architecture.json para refletir a estrutura ATUAL do projeto
#    (documente como está, não como deveria ser)
# 3. Use CLAUDE.md para orientar novas features
# 4. Aplique SKILL-NO-DUPLICATION.md ao refatorar código legado
```

---

## COMO REFERENCIAR NAS SUAS MENSAGENS

Seja explícito sobre quais arquivos a IA deve seguir:

```
"Seguindo CLAUDE.md e SKILL-SECURITY.md, crie o endpoint de criação de usuário"

"Aplicando as regras de SKILL-NO-DUPLICATION.md, refatore o módulo de pagamentos"

"Antes de implementar, responda o PRE-TASK.md para esta feature de autenticação"

"Seguindo architecture.json, onde deveria ficar a lógica de envio de email?"
```

---

## CUSTOMIZANDO PARA SEU PROJETO

### architecture.json
Edite os campos:
- `project.name`, `type`, `language`, `runtime`
- `structure` — adapte para a estrutura real do seu projeto
- `hard_limits` — ajuste os números se necessário
- `forbidden` — adicione padrões específicos que quer evitar

### CLAUDE.md
Adicione na seção de proibidos qualquer anti-padrão específico do seu time.

### Skills
Crie seus próprios skills para domínios específicos:
- `SKILL-PAYMENTS.md` — regras para código de pagamento
- `SKILL-TESTS.md` — convenções de teste do projeto
- `SKILL-API-DESIGN.md` — padrões de design de API

---

## PRINCÍPIO FUNDAMENTAL

> A IA é uma ferramenta de amplificação.  
> Se você não tem julgamento de arquitetura, ela vai amplificar código ruim mais rápido.  
> Se você tem julgamento, ela vai amplificar código bom mais rápido.  
> 
> Este kit coloca o julgamento de um sênior dentro da ferramenta —  
> para construir código e infraestrutura que outro sênior possa reaproveitar, modificar e melhorar.
