# Pedilivery API Reference

Base URL local:

```text
http://localhost:3001/api
```

## Auth Admin JWT

### POST `/auth/login`

Body:

```json
{ "password": "sua-senha-admin" }
```

Resposta:

```json
{ "token": "jwt", "message": "Login realizado com sucesso" }
```

Use o token nas rotas admin:

```http
Authorization: Bearer <jwt>
```

### POST `/auth/verify`

Auth: Admin JWT.

## Products

### GET `/products`

Publico. Lista produtos.

### GET `/products/categories`

Publico. Lista categorias.

### POST `/products`

Auth: Admin JWT.

### PUT `/products/:id`

Auth: Admin JWT.

### DELETE `/products/:id`

Auth: Admin JWT.

## Orders

### POST `/orders`

Publico. O backend recalcula itens e total a partir dos produtos cadastrados.

Resposta inclui:

```json
{
  "id": 123,
  "tracking_token": "jwt-de-rastreio"
}
```

### GET `/orders/:id`

Auth: Admin JWT ou header de rastreio.

Para cliente:

```http
X-Order-Token: <tracking_token>
```

Sem JWT admin e sem `X-Order-Token`, retorna `401`.

### GET `/orders`

Auth: Admin JWT.

### GET `/orders/metrics/summary`

Auth: Admin JWT.

### PATCH `/orders/:id/status`

Auth: Admin JWT.

### DELETE `/orders/:id`

Auth: Admin JWT.

## Settings

### GET `/settings`

Publico.

### PUT `/settings`

Auth: Admin JWT.
