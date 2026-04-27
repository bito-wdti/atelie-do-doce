create extension if not exists pgcrypto;

drop database if exists ateliedodoce;

create database ateliedodoce;

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  imagem_url text,
  ordem integer default 0,
  created_at timestamptz default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete set null,
  nome text not null,
  descricao text,
  preco decimal(10,2) not null,
  imagem_url text,
  status text default 'Em estoque',
  created_at timestamptz default now()
);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text,
  cliente_whatsapp text,
  status text default 'Pendente',
  valor_total decimal(10,2) not null,
  forma_pagamento text,
  endereco_entrega jsonb,
  created_at timestamptz default now()
);

create table if not exists itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  produto_id uuid references produtos(id),
  quantidade integer not null default 1,
  preco_unitario decimal(10,2) not null
);

create table if not exists configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_loja text default 'Pedilivery',
  logo_url text,
  horarios_funcionamento jsonb,
  metodos_pagamento_aceitos text[],
  updated_at timestamptz default now()
);

create index if not exists idx_produtos_categoria on produtos(categoria_id);
create index if not exists idx_itens_pedido_pedido on itens_pedido(pedido_id);
create index if not exists idx_itens_pedido_produto on itens_pedido(produto_id);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_pedidos_created_at on pedidos(created_at);

insert into configuracoes (nome_loja, metodos_pagamento_aceitos)
values (
  'Pedilivery',
  array['Pix', 'Cartão', 'Dinheiro']
)
on conflict do nothing;