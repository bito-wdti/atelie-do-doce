-- =============================================================
-- SCHEMA UPDATE v3
-- - users: adicionado cpf, telefone, delivery_address
-- - orders: removido customer_name, customer_phone
-- - orders: adicionado user_id (FK -> users.id)
-- =============================================================


-- -------------------------------------------------------------
-- USERS: novos campos
-- -------------------------------------------------------------
alter table public.users
  add column if not exists cpf text null,
  add column if not exists telefone text null,
  add column if not exists delivery_address text null;


-- -------------------------------------------------------------
-- ORDERS: remover campos de cliente avulso
-- -------------------------------------------------------------
alter table public.orders
  drop column if exists customer_name,
  drop column if exists customer_phone;


-- -------------------------------------------------------------
-- ORDERS: vincular ao usuário cadastrado
-- -------------------------------------------------------------
alter table public.orders
  add column if not exists user_id uuid null references public.users(id) on delete set null;

create index if not exists idx_orders_user_id
  on public.orders using btree (user_id);


-- -------------------------------------------------------------
-- USERS: dados ficcionais de cpf e telefone para os 10 usuários de teste
-- -------------------------------------------------------------
update public.users set cpf = '123.456.789-09', telefone = '(84) 99123-4567' where id = '28e5af05-c231-464a-b90c-964372f3e2ca'; -- Nicole Sena
update public.users set cpf = '234.567.890-12', telefone = '(11) 98234-5678' where id = '6f7734e4-0e80-4823-8501-8469fde3060e'; -- Jorge Oliveira
update public.users set cpf = '345.678.901-23', telefone = '(21) 97345-6789' where id = '73dddf65-80da-4282-b9b3-9b670268d313'; -- Lucia Nascimento
update public.users set cpf = '456.789.012-34', telefone = '(84) 99456-7890' where id = '9bcbbbed-d17a-4546-baab-f2557539a782'; -- Pedro Quintiliano
update public.users set cpf = '567.890.123-45', telefone = '(84) 98567-8901' where id = 'a66f3436-6b4d-42ea-b426-a144b3cf8a2f'; -- Valdemir Cordeiro
update public.users set cpf = '678.901.234-56', telefone = '(31) 99678-9012' where id = 'a7323fb7-f751-4b6a-9e2f-86a0c289743d'; -- Lucas Pereira
update public.users set cpf = '789.012.345-67', telefone = '(71) 98789-0123' where id = 'ab346e62-92a7-4541-bf79-2cb6324b3038'; -- Fernando Carvalho
update public.users set cpf = '890.123.456-78', telefone = '(21) 99890-1234' where id = 'c0360b4d-3002-4b77-b3ae-bb8dcff8c5d5'; -- João Silva
update public.users set cpf = '901.234.567-89', telefone = '(41) 97901-2345' where id = 'ec0afff6-12a1-4330-a8fc-dd7dd32904ef'; -- Maria Eduarda Coelho
update public.users set cpf = '012.345.678-90', telefone = '(85) 99012-3456' where id = 'ffe04205-b7e9-4e03-ae5b-91c8cd2133a6'; -- Beatriz Sobral
