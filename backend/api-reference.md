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

### POST /orders
Cliente finaliza a compra. Cria o pedido e os itens juntos numa única chamada.

**Body:**
```json
{
  "customer_name": "Maria Silva",
  "customer_phone": "(84) 99999-1234",
  "total_amount": 89.90,
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

**Campos obrigatórios:** `customer_name`, `total_amount`, `items`

**Resposta (201):**
```json
{
  "id": 47,
  "customer_name": "Maria Silva",
  "customer_phone": "(84) 99999-1234",
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
    "customer_name": "Maria Silva",
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
  "customer_name": "Maria Silva",
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

