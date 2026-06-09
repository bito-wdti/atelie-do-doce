# Atelie do Doce API — Referência Completa

Base URL: `http://localhost:3001/api`

Rotas com 🔒 precisam do header:
```
Authorization: Bearer <token>
```
O token é obtido no login e salvo no localStorage como `adminToken`.

---

## AUTH

### POST /auth/login
Faz login do admin e retorna o JWT.

**Body:**
```json
{
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "message": "Login realizado com sucesso"
}
```

---

### POST /auth/verify 🔒
Verifica se o token ainda é válido. Não precisa de body.

**Resposta:**
```json
{
  "valid": true,
  "role": "admin"
}
```

---

## PRODUTOS

### GET /products
Lista todos os produtos. Aceita filtros opcionais via query string.

```
GET /api/products
GET /api/products?category=Bolos
GET /api/products?search=vulcão
GET /api/products?status=Em estoque
GET /api/products?category=Bolos&search=cenoura
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Vulcão de Ninho",
    "detail": "Delicioso bolo vulcão",
    "category": "Vulcões",
    "price": 35.00,
    "stock": "Em estoque",
    "img": "https://..."
  },
  { "..." }
]
```

---

### GET /products/categories
Lista as categorias únicas existentes.

**Resposta:**
```json
["Vulcões", "Normais", "Doces", "Bolos", "Bebidas", "Tortas"]
```

---

### GET /products/:id
Detalhe de um produto específico.

```
GET /api/products/1
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Vulcão de Ninho",
  "detail": "Delicioso bolo vulcão",
  "category": "Vulcões",
  "price": 35.00,
  "stock": "Em estoque",
  "img": "https://..."
}
```

---

### POST /products 🔒
Cria um produto novo.

**Body:**
```json
{
  "name": "Bolo de Chocolate",
  "detail": "Massa fofinha com cobertura cremosa",
  "category": "Bolos",
  "price": 42.90,
  "stock": "Em estoque",
  "img": "https://link-da-imagem.com/foto.jpg"
}
```

**Campos obrigatórios:** `name`, `price`

**Resposta (201):**
```json
{
  "id": 12,
  "name": "Bolo de Chocolate",
  "detail": "Massa fofinha com cobertura cremosa",
  "category": "Bolos",
  "price": 42.90,
  "stock": "Em estoque",
  "img": "https://link-da-imagem.com/foto.jpg"
}
```

---

### PUT /products/:id 🔒
Atualiza um produto existente. Pode enviar só os campos que mudaram.

```
PUT /api/products/12
```

**Body (atualização completa):**
```json
{
  "name": "Bolo de Chocolate Trufado",
  "detail": "Agora com recheio de trufa",
  "category": "Bolos",
  "price": 49.90,
  "stock": "Em estoque",
  "img": "https://nova-imagem.com/foto.jpg"
}
```

**Body (só mudar o estoque):**
```json
{
  "stock": "Esgotado"
}
```

**Resposta:**
```json
{
  "id": 12,
  "name": "Bolo de Chocolate Trufado",
  "price": 49.90,
  "stock": "Em estoque",
  "..." : "..."
}
```

---

### DELETE /products/:id 🔒
Remove um produto.

```
DELETE /api/products/12
```

**Resposta:**
```json
{
  "message": "Produto removido com sucesso"
}
```

---

## PEDIDOS

### POST /orders 🔒
Cliente autenticado finaliza a compra. Cria o pedido e os itens juntos numa única chamada. O `user_id` é extraído automaticamente do token JWT — não enviar no body.

**Headers obrigatórios:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "payment_method": "Cartão de Crédito",
  "delivery_address": "Rua das Flores, 123, Ap 4 - Tirol, Natal/RN",
  "notes": "Sem amendoim por favor",
  "items": [
    {
      "product_id": 1,
      "product_name": "Vulcão de Ninho",
      "quantity": 2,
      "unit_price": 35.00
    },
    {
      "product_id": 4,
      "product_name": "Bolo de Milho",
      "quantity": 1,
      "unit_price": 19.90
    }
  ]
}
```

**Campos obrigatórios:** `delivery_address`, `items`

**Resposta (201):**
```json
{
  "id": 47,
  "user_id": "9bcbbbed-d17a-4546-baab-f2557539a782",
  "user": { "id": "9bcbbbed-d17a-4546-baab-f2557539a782", "name": "Maria Silva", "email": "maria@email.com", "telefone": "(84) 99999-1234" },
  "total_amount": 89.90,
  "status": "Pendente",
  "payment_method": "Cartão de Crédito",
  "delivery_address": "Rua das Flores, 123, Ap 4 - Tirol, Natal/RN",
  "notes": "Sem amendoim por favor",
  "created_at": "2025-04-27T14:30:00Z",
  "order_items": [
    {
      "id": 91,
      "order_id": 47,
      "product_id": 1,
      "product_name": "Vulcão de Ninho",
      "quantity": 2,
      "unit_price": 35.00
    },
    {
      "id": 92,
      "order_id": 47,
      "product_id": 4,
      "product_name": "Bolo de Milho",
      "quantity": 1,
      "unit_price": 19.90
    }
  ]
}
```

---

### GET /orders/:id
Cliente rastreia o próprio pedido pelo ID (sem autenticação).

```
GET /api/orders/47
```

**Resposta:** mesmo formato do POST acima, com os itens incluídos.

---

### GET /orders 🔒
Admin lista todos os pedidos. Aceita filtros via query string.

```
GET /api/orders
GET /api/orders?status=Pendente
GET /api/orders?search=Maria
GET /api/orders?startDate=2025-04-01&endDate=2025-04-27
GET /api/orders?status=Entregue&startDate=2025-04-01
```

**Status válidos:** `Pendente`, `Em Preparo`, `Saiu para Entrega`, `Entregue`, `Cancelado`

**Resposta:**
```json
[
  {
    "id": 47,
    "user_id": "9bcbbbed-d17a-4546-baab-f2557539a782",
    "user": { "id": "9bcbbbed-d17a-4546-baab-f2557539a782", "name": "Maria Silva", "email": "maria@email.com", "telefone": "(84) 99999-1234" },
    "total_amount": 89.90,
    "status": "Pendente",
    "created_at": "2025-04-27T14:30:00Z",
    "order_items": [ { "..." } ]
  }
]
```

---

### GET /orders/metrics/summary 🔒
Retorna métricas para o Dashboard.

```
GET /api/orders/metrics/summary
GET /api/orders/metrics/summary?startDate=2025-04-01&endDate=2025-04-27
```

**Resposta:**
```json
{
  "total": 120,
  "revenue": 4850.70,
  "pending": 8,
  "delivered": 105,
  "canceled": 7
}
```

---

### PATCH /orders/:id/status 🔒
Admin muda o status de um pedido.

```
PATCH /api/orders/47/status
```

**Body:**
```json
{
  "status": "Em Preparo"
}
```

**Status válidos:**
- `"Pendente"`
- `"Em Preparo"`
- `"Saiu para Entrega"`
- `"Entregue"`
- `"Cancelado"`

**Resposta:**
```json
{
  "id": 47,
  "status": "Em Preparo",
  "user": { "name": "Maria Silva" },
  "..." : "..."
}
```

---

### DELETE /orders/:id 🔒
Remove um pedido.

```
DELETE /api/orders/47
```

**Resposta:**
```json
{
  "message": "Pedido removido com sucesso"
}
```

---

## USUARIOS

### POST /users
Cria um novo usuário (cadastro). Retorna token automaticamente — usuário já fica logado.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123@",
  "role": "Cliente",
  "avatar_url": null
}
```

**Campos obrigatórios:** `name`, `email`, `password`

**Validações:**
- Email deve ter formato válido (`@` + domínio)
- Email não pode estar cadastrado
- Senha deve ter:
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 número
  - Pelo menos 1 símbolo
- Se `role` for diferente de `"Cliente"`, requer token de admin

**Resposta (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "9bcbbbed-d17a-4546-baab-f2557539a782",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "Cliente",
    "avatar_url": null,
    "created_at": "2026-04-28T03:38:22.195030Z"
  }
}
```

**Erros possíveis:**

- 400 (campos obrigatórios):
```json
{ "error": "Nome, email e senha são obrigatórios" }
```

- 400 (email inválido):
```json
{ "error": "Email inválido" }
```

- 409 (email já cadastrado):
```json
{ "error": "Email já cadastrado" }
```

- 400 (senha fraca):
```json
{
  "errors": [
    "Senha deve ter pelo menos 8 caracteres",
    "Senha deve conter pelo menos uma letra maiúscula",
    "Senha deve conter pelo menos um número",
    "Senha deve conter pelo menos um símbolo"
  ]
}
```

- 401 (role restrito sem token):
```json
{ "error": "Token de autenticação não fornecido" }
```

- 403 (role restrito sem admin):
```json
{ "error": "Acesso negado. Apenas administradores." }
```

---

### POST /users/login
Faz login do usuário e retorna o JWT.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "Senha123@"
}
```

**Campos obrigatórios:** `email`, `password`

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "9bcbbbed-d17a-4546-baab-f2557539a782",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "Cliente",
    "avatar_url": null,
    "created_at": "2026-04-28T03:38:22.195030Z"
  }
}
```

**Erros possíveis:**

- 400:
```json
{ "error": "Email e senha são obrigatórios" }
```

- 401:
```json
{ "error": "Credenciais inválidas" }
```

---

### GET /users/me 🔒
Retorna os dados do usuário logado (exceto senha).

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": "9bcbbbed-d17a-4546-baab-f2557539a782",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "Cliente",
  "avatar_url": null,
  "created_at": "2026-04-28T03:38:22.195030Z"
}
```

**Erros possíveis:**

- 401:
```json
{ "error": "Token de autenticação não fornecido" }
```
```json
{ "error": "Token inválido ou expirado" }
```

---

### GET /users 🔒
Lista todos os usuários (apenas admin). Aceita filtros via query string.

**Headers:**
```
Authorization: Bearer <token_admin>
```

```
GET /api/users
GET /api/users?role=Cliente
GET /api/users?startDate=2026-01-01&endDate=2026-04-28
```

**Parâmetros de query (opcionais):**
- `role` — filtra por função do usuário
- `startDate` — filtra usuários criados a partir desta data
- `endDate` — filtra usuários criados até esta data

**Resposta (200):**
```json
[
  {
    "id": "9bcbbbed-d17a-4546-baab-f2557539a782",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "Cliente",
    "avatar_url": null,
    "created_at": "2026-04-28T03:38:22.195030Z"
  },
  {
    "id": "8abbbbed-d17a-4546-baab-f2557539a781",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "role": "Admin",
    "avatar_url": null,
    "created_at": "2026-04-27T10:00:00.000000Z"
  }
]
```

**Erros possíveis:**

- 401:
```json
{ "error": "Token de autenticação não fornecido" }
```
```json
{ "error": "Token inválido ou expirado" }
```

- 403:
```json
{ "error": "Acesso negado. Apenas administradores." }
```

---

