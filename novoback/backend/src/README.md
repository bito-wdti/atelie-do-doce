# Backend src

Codigo-fonte do backend Express.

- `app.js`: entrada HTTP, CORS, rate limit, headers e rotas.
- `controllers/`: validacao e regras de entrada.
- `models/`: acesso ao Supabase.
- `middlewares/`: JWT, seguranca e tratamento de erros.
- `utils/`: validacao e helpers.

Autenticacao admin usa JWT via `Authorization: Bearer <token>`.
Rastreio de pedido usa `X-Order-Token`, gerado em `POST /api/orders`.
