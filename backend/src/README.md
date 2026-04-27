# Pedilivery — Backend MVC

---

## Estrutura de pastas

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Cliente Supabase (service key)
│   ├── models/
│   │   ├── productModel.js      # Queries de produtos
│   │   ├── orderModel.js        # Queries de pedidos + itens
│   │   └── settingsModel.js     # Queries de configurações da loja
│   ├── controllers/
│   │   ├── authController.js    # Login admin + verificar JWT
│   │   ├── productController.js # CRUD de produtos
│   │   ├── orderController.js   # Criar/listar/atualizar pedidos
│   │   └── settingsController.js# Ler/salvar config da loja
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── settingsRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Valida JWT nas rotas admin
│   │   └── errorHandler.js     # Erro global
│   └── app.js                  # Ponto de entrada
├── .env.example
└── package.json
```

---

## Setup

### 1. Criar o arquivo .env

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```


> ⚠️ A `SUPABASE_SERVICE_KEY` (service_role) está no Supabase em:
> Project Settings → API → service_role secret
> **Nunca exponha ela no frontend!**

### 2. Instalar dependências

```bash
cd backend
npm install
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Servidor sobe em `http://localhost:3001`

---

## Todos os endpoints

| Método | Rota                        | Auth  | Descrição                          |
|--------|-----------------------------|-------|------------------------------------|
| GET    | /api/health                 | —     | Health check                       |
| POST   | /api/auth/login             | —     | Login admin → retorna JWT          |
| POST   | /api/auth/verify            | Admin | Verifica se o token é válido       |
| GET    | /api/products               | —     | Lista produtos (filtros via query) |
| GET    | /api/products/categories    | —     | Lista categorias                   |
| GET    | /api/products/:id           | —     | Detalhe de produto                 |
| POST   | /api/products               | Admin | Cria produto                       |
| PUT    | /api/products/:id           | Admin | Atualiza produto                   |
| DELETE | /api/products/:id           | Admin | Remove produto                     |
| POST   | /api/orders                 | —     | Cliente finaliza compra            |
| GET    | /api/orders/:id             | —     | Cliente rastreia pedido            |
| GET    | /api/orders                 | Admin | Lista pedidos (filtros via query)  |
| GET    | /api/orders/metrics/summary | Admin | Métricas para o dashboard          |
| PATCH  | /api/orders/:id/status      | Admin | Muda status do pedido              |
| DELETE | /api/orders/:id             | Admin | Remove pedido                      |
| GET    | /api/settings               | —     | Config da loja                     |
| PUT    | /api/settings               | Admin | Salva config da loja               |

---

## Configurar o frontend

### 1. Adicionar variável de ambiente no Vite

No arquivo `.env.local` do **frontend**, adicione:

```env
VITE_API_URL=http://localhost:3001/api
```

