# 🍰 Ateliê do Doce

Sistema web para gerenciamento e realização de pedidos da confeitaria online, Ateliê do Doce, permitindo que clientes façam compras de forma prática e que gestores acompanhem métricas e pedidos em tempo real.

## 📌 Sobre o Projeto

Este projeto foi desenvolvido como parte de um trabalho acadêmico e tem como objetivo simular uma aplicação real de e-commerce voltada para o segmento de confeitaria.

A plataforma permite:
- Compra de doces via catálogo online
- Gestão de pedidos
- Controle de produtos
- Visualização de métricas e relatórios

## 🎯 Objetivo

Oferecer uma solução digital que aumente a comodidade dos clientes e melhore a gestão de pedidos e vendas da confeitaria.

## 👥 Público-alvo

Pessoas que desejam comprar doces com praticidade, e gestores que precisam acompanhar pedidos e desempenho do negócio.

---

## ⚙️ Funcionalidades

### 👤 Usuário
- Cadastro e login
- Edição de perfil
- Alteração de senha
- Visualização de pedidos

### 🛒 Cliente
- Visualizar catálogo de produtos
- Adicionar produtos ao carrinho
- Criar pedidos com data, hora e entrega
- Acompanhar status dos pedidos

### 🧑‍💼 Gestor
- Visualizar pedidos do dia
- Gerenciar status dos pedidos
- Cadastrar, editar e desativar produtos
- Visualizar dashboard com métricas
- Exportar relatórios (CSV/PDF)
- Visualizar gráfico de vendas

---

## 🔒 Requisitos Não Funcionais

### ⚡ Desempenho
- Tempo de resposta ≤ 3 segundos
- Suporte a 100 usuários simultâneos

### 🔐 Segurança
- Senhas criptografadas com bcrypt
- Autenticação via JWT (expiração de 24h)
- Proteção contra SQL Injection
- Comunicação via HTTPS
- Rate limiting no login

### 📱 Usabilidade
- Interface responsiva (mobile-first)
- Acessibilidade (WCAG 2.1)
- Interface intuitiva

### ☁️ Confiabilidade
- Uptime mínimo de 99%
- Backup diário automático
- Recuperação de dados sem perda

---

## 🧱 Tecnologias Utilizadas

### Frontend
- React.js
- Tailwind CSS
- TypeScript

### Backend
- Node.js
- TypeScript

### Banco de Dados
- Supabase

### Infraestrutura
- Hostinger

---

## 🏗️ Arquitetura

O sistema seguirá uma arquitetura em camadas (MVC ou similar), com separação entre frontend e backend.

---

## 📂 Estrutura de Pastas

  project-root/
	
  │
	
  ├── frontend/
	
  │ ├── src/
	
  │ │ ├── components/
	
  │ │ ├── pages/
	
  │ │ ├── services/
	
  │ │ ├── hooks/
	
  │ │ └── styles/
	
  │
	
  ├── backend/
	
  │ ├── src/
	
  │ │ ├── controllers/
	
  │ │ ├── services/
	
  │ │ ├── models/
	
  │ │ ├── routes/
	
  │ │ ├── middlewares/
	
  │ │ └── utils/
	
  │
	
  ├── docs/
	
  │ ├── requisitos/
	
  │ ├── diagramas/
	
  │ └── prototipos/
	
  │
	
  └── README.md
	

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado
- Git

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


### 🎨 Frontend

cd frontend

npm install

npm run dev

## 🧪 Testes

Cobertura mínima: 70%
Testes unitários e de integração

## 👨‍💻 Equipe

Mirelle Geovanna - 12824125558

Pedro Otávio - 12824129804

Lucas da Fonseca Oliveira - 12824130078

Pedro Quintiliano - 1282618357

Paulo Ricardo - 12825216920


## 💡 Problema Resolvido

O sistema melhora a experiência de compra de doces online e fornece ferramentas para gestão eficiente do negócio, incluindo métricas e relatórios.

## 📌 Status do Projeto

🚧 Em fase de levantamento de requisitos e prototipagem.

# Pedilivery

Aplicacao de delivery com frontend React/Vite e backend Express em `backend`.

## Requisitos

- Node.js 22+
- Projeto Supabase configurado
- Variaveis baseadas em `.env.example` e `backend/.env.example`

## Desenvolvimento

```bash
npm install
npm --prefix backend install
npm run dev
```

O script `npm run dev` inicia frontend e backend juntos. Para rodar separado:

```bash
npm run dev:frontend
npm run dev:backend
```

## Verificacoes

```bash
npm run typecheck
npm run build
npm run check:backend
npm audit --omit=dev
npm --prefix backend audit --omit=dev
```

## Produção

Nao publique arquivos `.env`. Configure `JWT_SECRET`, `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL` e `VITE_API_URL` diretamente no provedor de deploy.
