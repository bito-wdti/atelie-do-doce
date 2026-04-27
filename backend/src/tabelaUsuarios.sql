create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha text not null,
  avatar_url text,
  privilegios text default 'Cliente',
  created_at timestamptz default now()
);


create index if not exists idx_usuarios_email on usuarios(email);
create index if not exists idx_usuarios_privilegios on usuarios(privilegios);