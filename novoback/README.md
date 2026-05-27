# Pedilivery - Backend Atualizado

Backend Express usado pelo frontend principal do Pedilivery.

## Rodar em localhost

Na raiz do projeto:

```bash
npm run dev
```

Ou separado:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:3001`
Frontend: `http://127.0.0.1:3000` ou porta exibida pelo Vite.

## Autenticacao

O painel admin usa JWT:

- `POST /api/auth/login` retorna `token`
- o frontend salva em `localStorage.adminToken`
- rotas admin exigem `Authorization: Bearer <token>`

## Rastreio de pedidos

O cliente nao acessa pedido apenas por ID. Ao criar o pedido, o backend retorna `tracking_token`.
O frontend guarda esse token localmente e envia nas consultas como header:

```http
X-Order-Token: <tracking_token>
```

Assim a URL pode ficar limpa para apresentacao:

```text
/tracking/123
```

## Endpoints principais

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/api/health` | Publico | Health check |
| POST | `/api/auth/login` | Publico | Login admin com JWT |
| POST | `/api/auth/verify` | Admin JWT | Verifica token |
| GET | `/api/products` | Publico | Lista produtos |
| GET | `/api/products/categories` | Publico | Lista categorias |
| POST | `/api/products` | Admin JWT | Cria produto |
| PUT | `/api/products/:id` | Admin JWT | Atualiza produto |
| DELETE | `/api/products/:id` | Admin JWT | Remove produto |
| POST | `/api/orders` | Publico | Cria pedido e retorna tracking token |
| GET | `/api/orders/:id` | Admin JWT ou X-Order-Token | Detalhe/rastreio do pedido |
| GET | `/api/orders` | Admin JWT | Lista pedidos |
| PATCH | `/api/orders/:id/status` | Admin JWT | Atualiza status |
| GET | `/api/settings` | Publico | Configuracoes da loja |
| PUT | `/api/settings` | Admin JWT | Atualiza configuracoes |

## Verificacoes

```bash
npm run typecheck
npm run build
npm run check:backend
npm run test:backend
npm audit
npm --prefix novoback/backend audit
```
