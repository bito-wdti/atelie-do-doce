create table public.users (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  password text not null,
  avatar_url text null,
  role text null default 'Cliente'::text,
  created_at timestamp with time zone null default now(),
  constraint usuarios_pkey primary key (id),
  constraint usuarios_email_key unique (email)
) TABLESPACE pg_default;

create index IF not exists idx_usuarios_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_usuarios_privilegios on public.users using btree (role) TABLESPACE pg_default;

INSERT INTO "public"."users" ("id", "name", "email", "password", "avatar_url", "role", "created_at") VALUES ('28e5af05-c231-464a-b90c-964372f3e2ca', 'Nicole Sena', 'nicoles@email.com', '$2a$10$T1EWKhRbCNJ06YZlSUvWCeM9Oook47c6x58LMUVU9Z8/A13hTQ60K', null, 'Cliente', '2026-04-28 19:50:23.447585+00'), ('6f7734e4-0e80-4823-8501-8469fde3060e', 'Jorge Oliveira', 'jorgeo@email.com', '$2a$10$YNvUbO9lZkUV26C6WI3k/Og6u7ZMCWA.fBCDMS//uYmK0fnlsDGf6', null, 'Cliente', '2026-04-28 19:51:40.262238+00'), ('73dddf65-80da-4282-b9b3-9b670268d313', 'Lucia Nascimento', 'lucian@email.com', '$2a$10$DCli5myNM.DrM07RQAI00O2u6tvYeesst70kS0ad9F3yTYDdByry.', null, 'Cliente', '2026-04-28 19:52:08.464223+00'), ('9bcbbbed-d17a-4546-baab-f2557539a782', 'Pedro Quintiliano', 'pedro@email.com', '$2a$12$lLbexrQ8w/uicYHKn4aEMe75zdDyPaECQxvq6TeKop6jkIPFtms8i', null, 'Cliente', '2026-04-28 03:38:22.19503+00'), ('a66f3436-6b4d-42ea-b426-a144b3cf8a2f', 'Valdemir Cordeiro', 'valdemirc@email.com', '$2a$10$9V5htrt1xDdUDhHv.qYCceNSsMKT7EgWLDWACoULy8V7J60inbND2', null, 'Gestor', '2026-04-28 19:53:00.090558+00'), ('a7323fb7-f751-4b6a-9e2f-86a0c289743d', 'Lucas Pereira', 'lucasp@email.com', '$2a$10$AD3DY5kpm/u8S1ThFbQ6RuPb98tmvw2GWDrZZ0dbNRjXaa.QKsN/S', null, 'Cliente', '2026-04-28 19:48:39.667718+00'), ('ab346e62-92a7-4541-bf79-2cb6324b3038', 'Fernando Carvalho', 'fefecarvalho@email.com', '$2a$10$LsDLE7hmbFtX7puZRrnN4e8Q7kywEKoDW6NNXawidonOS7LPhw2be', null, 'Cliente', '2026-04-28 19:49:36.398979+00'), ('c0360b4d-3002-4b77-b3ae-bb8dcff8c5d5', 'João Silva', 'joao@email.com', '$2a$10$GViNigzn9LZbabc0o37pUONfin9Pskk/2tI.4unySWSnT2TL9qrD2', null, 'Cliente', '2026-04-28 19:42:52.075343+00'), ('ec0afff6-12a1-4330-a8fc-dd7dd32904ef', 'Maria Eduarda Coelho', 'dudacoelho@email.com', '$2a$10$dAYmKf.OPgZ94FqP55dU9.87rgkZ62atwSBcrgSLP2RkWG8ScGmsi', null, 'Cliente', '2026-04-28 20:50:21.022919+00'), ('ffe04205-b7e9-4e03-ae5b-91c8cd2133a6', 'Beatriz Sobral', 'beatrizs@email.com', '$2a$10$yVeq97pY6flSKkcap04asu7ndFsu0SR7z4yPuldKIfkvqgfDxf8UG', null, 'Cliente', '2026-04-28 19:49:56.316441+00');