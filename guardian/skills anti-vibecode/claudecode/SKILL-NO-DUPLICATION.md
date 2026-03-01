# SKILL-NO-DUPLICATION.md — O Maior Problema do Vibe Coding

> Este skill combate o problema #1 identificado nas pesquisas:
> duplicação de código 4x acima do normal em projetos com IA.

---

## A REGRA SIMPLES

**Se você escreveu algo parecido antes neste projeto, PARE.**
Vá encontrar onde está e reutilize ou estenda.

---

## COMO IDENTIFICAR DUPLICAÇÃO ANTES DE CRIAR

Antes de criar qualquer função, busque no projeto:

```bash
# Busca por função similar
grep -r "function get" src/
grep -r "def get_" src/

# Busca por padrão similar
grep -r "findById\|find_by_id\|getById" src/

# Busca por imports do mesmo módulo em muitos lugares
grep -r "import.*UserService" src/
```

Se encontrar algo parecido → **estenda o que existe, não crie novo**.

---

## OS 4 TIPOS DE DUPLICAÇÃO E COMO RESOLVER

### Tipo 1: Lógica Idêntica em Lugares Diferentes
```typescript
// ❌ Duplicado em user-controller.ts
const formattedDate = new Date(user.createdAt).toLocaleDateString('pt-BR')

// ❌ Duplicado em order-controller.ts  
const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR')

// ✅ Extraia para shared/utils/date.ts
export function formatDateBR(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}
```

### Tipo 2: Validação Repetida
```typescript
// ❌ Validação de email em 3 lugares diferentes
if (!email || !email.includes('@')) throw new Error('Invalid email')

// ✅ Um schema, usado em todos os lugares
// shared/schemas/common.ts
export const emailSchema = z.string().email('Email inválido')

// Reutilizado em qualquer módulo:
const { email } = createUserSchema.parse(input)
```

### Tipo 3: Acesso ao Banco Espalhado
```typescript
// ❌ A IA frequentemente cria isso — query direta em vários lugares
// Em user-controller.ts:
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])

// Em order-service.ts:
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])

// ✅ Um único repository
// modules/user/user-repository.ts
export async function findUserById(userId: string): Promise<User | null> {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId])
  return result.rows[0] ?? null
}
// Todos importam do repository, nunca fazem query direta
```

### Tipo 4: Tratamento de Erro Repetido
```typescript
// ❌ try/catch idêntico em 10 controllers
try {
  const user = await userService.create(data)
  res.json(user)
} catch (error) {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ✅ Um middleware centralizado de erro
// shared/middlewares/error-handler.ts
export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message })
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message })
  if (err instanceof UnauthorizedError) return res.status(403).json({ error: err.message })
  
  logger.error('Unexpected error', { err, path: req.path })
  return res.status(500).json({ error: 'Internal server error' })
}

// Controllers ficam limpos:
async function createUser(req, res, next) {
  try {
    const user = await userService.create(req.body)
    res.json(user)
  } catch (error) {
    next(error)  // delega pro middleware
  }
}
```

---

## ONDE COLOCAR CÓDIGO COMPARTILHADO

| O código é usado em... | Coloque em... |
|---|---|
| Só 1 módulo | Dentro do próprio módulo |
| 2+ módulos do mesmo domínio | `shared/utils/` ou `shared/schemas/` |
| É acesso ao banco de um domínio | `modules/[dominio]/repository.ts` |
| É middleware HTTP | `shared/middlewares/` |
| É erro customizado | `shared/errors/` |
| É tipo/interface global | `shared/types/` |

**Regra do polegar:** Só vai para `shared/` quando for usado em 2+ módulos.  
Na dúvida, começa no módulo e move depois.

---

## SINAIS DE QUE VOCÊ ESTÁ DUPLICANDO

🚨 Você está copiando e colando código de outro arquivo  
🚨 Você está escrevendo uma função com nome muito parecido com outra que existe  
🚨 Você está importando o mesmo módulo em 5+ arquivos para fazer a mesma coisa  
🚨 Você está re-implementando validação que já existe em outro lugar  
🚨 Você está escrevendo a mesma query SQL em controllers diferentes  

Se qualquer um desses acontecer → **PARE e encontre onde extrair**.
