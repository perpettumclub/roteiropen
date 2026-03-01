# SKILL-MAINTAINABILITY.md — Código que Sobrevive ao Tempo

> Este skill existe para evitar a "slop layer" — aquela camada de código
> que funciona mas ninguém entende e ninguém consegue consertar quando quebra.

---

## O TESTE DO DEV SÊNIOR

Antes de finalizar qualquer código, faça esta pergunta:

> "Um dev sênior encontrando este código pela primeira vez consegue  
> entender a intenção, confiar na estrutura e modificar com segurança?"

Se a resposta for não → reescreva. O objetivo não é simplificar — é estruturar bem.
Código bom não é código fácil. É código **honesto**: faz o que diz, diz o que faz, e permite que outro sênior entre, entenda e melhore sem ter medo de quebrar tudo.

---

## PRINCÍPIOS DE CÓDIGO MANTÍVEL

### 1. Código auto-explicativo — nomes que eliminam comentários

```typescript
// ❌ Precisa de comentário para entender
// verifica se o usuário pode fazer a ação
if (u.r === 'admin' || (u.r === 'mod' && a.t !== 'del')) {
  proceed()
}

// ✅ O código É a documentação
const canPerformAction = user.role === 'admin' || 
  (user.role === 'moderator' && action.type !== 'delete')

if (canPerformAction) {
  proceed()
}
```

### 2. Early Return — menos indentação, mais clareza

```typescript
// ❌ Pirâmide da perdição — a IA adora criar isso
async function processOrder(orderId: string, userId: string) {
  const order = await orderRepository.findById(orderId)
  if (order) {
    if (order.userId === userId) {
      if (order.status === 'pending') {
        if (order.items.length > 0) {
          // lógica real aqui, enterrada em 4 níveis
          return await paymentService.process(order)
        }
      }
    }
  }
}

// ✅ Early return — lógica principal sem indentação
async function processOrder(orderId: string, userId: string) {
  const order = await orderRepository.findById(orderId)
  if (!order) throw new OrderNotFoundError(orderId)
  if (order.userId !== userId) throw new UnauthorizedError('Not your order')
  if (order.status !== 'pending') throw new InvalidOrderStatusError(order.status)
  if (order.items.length === 0) throw new EmptyOrderError(orderId)
  
  return await paymentService.process(order)
}
```

### 3. Funções pequenas com única responsabilidade

```typescript
// ❌ Função que faz tudo — impossível testar, impossível reutilizar
async function handleCheckout(req) {
  // valida input
  if (!req.body.items || req.body.items.length === 0) return error(400, 'No items')
  
  // calcula total
  let total = 0
  for (const item of req.body.items) {
    const product = await db.query('SELECT price FROM products WHERE id = $1', [item.id])
    total += product.rows[0].price * item.quantity
  }
  
  // aplica desconto
  if (req.body.couponCode) {
    const coupon = await db.query('SELECT * FROM coupons WHERE code = $1', [req.body.couponCode])
    if (coupon.rows[0] && coupon.rows[0].valid) {
      total = total * (1 - coupon.rows[0].discount)
    }
  }
  
  // processa pagamento
  const payment = await stripe.createCharge({ amount: total, ... })
  
  // salva pedido
  await db.query('INSERT INTO orders ...', [...])
  
  return success(200, payment)
}

// ✅ Cada função tem uma responsabilidade
async function handleCheckout(req) {
  const { items, couponCode } = checkoutSchema.parse(req.body)
  
  const subtotal = await calculateSubtotal(items)
  const discount = await applyCouponDiscount(subtotal, couponCode)
  const total = subtotal - discount
  
  const payment = await paymentService.charge(total, req.user.id)
  const order = await orderRepository.create({ items, total, paymentId: payment.id, userId: req.user.id })
  
  return order
}
```

### 4. Erros como cidadãos de primeira classe

```typescript
// shared/errors/index.ts — crie estes no início do projeto

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(reason: string) {
    super(`Unauthorized: ${reason}`, 'UNAUTHORIZED', 403)
  }
}

// Uso: erros descritivos que explicam o que aconteceu
throw new NotFoundError('User', userId)
throw new UnauthorizedError('Cannot delete another user\'s post')
```

---

## O QUE CRIA A "SLOP LAYER" — E COMO EVITAR

| Causa | Sintoma | Solução |
|---|---|---|
| Função que faz tudo | Impossível testar unitariamente | Quebre em funções menores |
| Nomes genéricos | Precisa ler o corpo pra entender | Renomeie antes de qualquer outra coisa |
| Sem tratamento de erro | Falha silenciosa | Erros explícitos sempre |
| Lógica espalhada | A mesma regra em 5 lugares | Centralize em um service |
| Comentários em vez de código claro | Comentário mente, código não | Reescreva até o código ser óbvio |
| Muita indentação | Cérebro não consegue rastrear | Early return, extraia blocos |
| Dependências ocultas | Difícil de testar e trocar | Injeção de dependência |

---

## SINAIS DE QUE VOCÊ ESTÁ CRIANDO DÍVIDA TÉCNICA

🚨 Você não consegue explicar o que uma função faz em 1 frase  
🚨 Você está com medo de mudar aquele arquivo  
🚨 Você precisa depurar para entender o fluxo  
🚨 Os testes são difíceis de escrever (sinal de design ruim)  
🚨 Você está copiando o bloco e mudando 1 variável  
🚨 O arquivo cresceu para > 300 linhas sem que você percebesse  

Quando esses sinais aparecem → **refatore antes de adicionar mais código**.

---

## REGRA DE OURO DA MANUTENIBILIDADE

> Construa código e infraestrutura legado que um dev sênior possa reaproveitar, mexer, modificar e melhorar.
> Isso significa: abstrações limpas, padrões previsíveis, separação de responsabilidades clara.
> Não é sobre simplificar — é sobre **estruturar com intenção**.

Se você demorou 20 minutos a mais para deixar a arquitetura limpa,
você economizou semanas de reescrita quando o projeto crescer.
