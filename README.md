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

### 🔧 Backend

cd backend

npm install

npm run dev

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
