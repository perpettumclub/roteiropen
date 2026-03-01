# SKILL-SECURITY.md — Segurança Não É Feature, É Fundação

> Aplicar em TODO código que envolve: dados de usuário, autenticação, banco de dados,
> APIs externas, upload de arquivos, variáveis de ambiente.

---

## REGRAS ABSOLUTAS (violação = reescrever tudo)

### 1. Camadas são sagradas
```
FRONTEND  →  API (validação)  →  SERVICE (lógica)  →  REPOSITORY (banco)
```
- Frontend NUNCA acessa banco diretamente
- Service NUNCA recebe objetos HTTP (req, res)
- Repository NUNCA contém lógica de negócio

### 2. Toda entrada de usuário é hostil
```typescript
// ❌ Errado - confiar no input
async function updateUser(userData: any) {
  await db.update('users', userData)  // SQL injection, mass assignment, tudo
}

// ✅ Certo - validar com schema
const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

async function updateUser(userId: string, rawInput: unknown) {
  const validatedData = updateUserSchema.parse(rawInput)  // lança erro se inválido
  await userRepository.update(userId, validatedData)
}
```

### 3. Variáveis de ambiente — nunca hardcoded
```typescript
// ❌ Errado
const db = new Database('postgresql://user:senha123@localhost/mydb')

// ✅ Certo - sempre via config/env.ts
// config/env.ts
const env = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
}).parse(process.env)

export { env }
```

### 4. Queries parametrizadas — sem exceção
```typescript
// ❌ SQL Injection esperando acontecer
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ Sempre parametrizado
const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
```

### 5. Autenticação e autorização
```typescript
// ❌ Verificar só no frontend
// Frontend: if (user.isAdmin) mostrarBotão()  → qualquer um pode chamar a API

// ✅ Verificar no backend em toda rota que precisar
async function deletePost(userId: string, postId: string) {
  const post = await postRepository.findById(postId)
  if (!post) throw new PostNotFoundError(postId)
  if (post.authorId !== userId) throw new UnauthorizedError('Not your post')
  await postRepository.delete(postId)
}
```

### 6. Logs seguros — nunca exponha dados sensíveis
```typescript
// ❌ Vaza dados
logger.info('User login', { email, password, token })

// ✅ Só o necessário para debug
logger.info('User login attempt', { userId, email, success: true })
```

---

## CHECKLIST DE SEGURANÇA POR TIPO DE CÓDIGO

### API Endpoint novo
- [ ] Rota requer autenticação? Adicionei middleware?
- [ ] Input validado com schema antes de qualquer processamento?
- [ ] Autorização verificada (não só autenticação)?
- [ ] Rate limiting necessário?
- [ ] Retorno não expõe dados que o usuário não deveria ver?

### Query de banco de dados
- [ ] Usa prepared statement / query parametrizada?
- [ ] Retorna só os campos necessários (SELECT específico, não SELECT *)?
- [ ] Tem índice nas colunas usadas no WHERE?
- [ ] Usuário do banco tem só as permissões necessárias?

### Upload de arquivo
- [ ] Valida tipo de arquivo pelo conteúdo, não só pela extensão?
- [ ] Limita tamanho máximo?
- [ ] Salva fora do diretório público?
- [ ] Gera nome aleatório (não usa o nome original do usuário)?

### Dados sensíveis
- [ ] Passwords sempre hasheados (bcrypt, argon2)?
- [ ] Tokens com expiração?
- [ ] Dados pessoais sensíveis encriptados em repouso?
- [ ] Dados de cartão NUNCA armazenados (use Stripe/gateway)?

---

## VULNERABILIDADES QUE A IA CRIA COM FREQUÊNCIA

| Vulnerabilidade | Como a IA faz | Como prevenir |
|---|---|---|
| SQL Injection | Concatena variáveis na query | Sempre use parâmetros |
| Mass Assignment | `db.update('users', req.body)` | Whitelist os campos aceitos |
| IDOR | Não verifica se o recurso é do usuário | Sempre cheque ownership |
| Secrets expostos | Hardcoda API keys no código | Sempre use .env |
| XSS | Renderiza HTML de input do usuário | Escape ou sanitize |
| Path Traversal | Usa input do usuário em file paths | Valide e normalize paths |
| Insecure Direct Object Reference | Expõe IDs sequenciais | Use UUIDs ou valide acesso |
