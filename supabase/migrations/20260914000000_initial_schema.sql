-- =============================================================================
-- Migration: initial_schema
-- Baseline do schema do aplicativo financeiro (estado final consolidado).
--
-- Origem: conteúdo do antigo scheme.md, já com todas as alterações incrementais
-- aplicadas (tag_id, nome obrigatório, descricao opcional).
--
-- Tabelas:
--   public.categoria_receita
--   public.categoria_despesa
--   public.receita
--   public.despesa
--   public.tags
-- =============================================================================

-- 1. Categorias de receita
create table public.categoria_receita (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  icone text,
  created_at timestamp with time zone default now(),
  constraint categoria_receita_pkey primary key (id),
  constraint categoria_receita_user_id_fkey foreign key (user_id) references auth.users (id)
);

-- 2. Categorias de despesa
create table public.categoria_despesa (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  icone text,
  created_at timestamp with time zone default now(),
  constraint categoria_despesa_pkey primary key (id),
  constraint categoria_despesa_user_id_fkey foreign key (user_id) references auth.users (id)
);

-- 3. Tags (marcadores de transações)
create table public.tags (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  cor text default '#2980b9',
  cor_texto text default '#ffffff',
  created_at timestamp with time zone default now(),
  constraint tags_pkey primary key (id),
  constraint tags_user_id_fkey foreign key (user_id) references auth.users (id)
);

-- 4. Receitas
create table public.receita (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  categoria_id uuid,
  nome text not null,
  descricao text,
  valor numeric not null,
  data_transacao timestamp with time zone not null default now(),
  recebido boolean default false,
  created_at timestamp with time zone default now(),
  parcela_atual integer default 1,
  parcela_total integer default 1,
  grupo_id uuid default gen_random_uuid(),
  tag_id uuid,
  constraint receita_pkey primary key (id),
  constraint receita_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint receita_categoria_id_fkey foreign key (categoria_id) references public.categoria_receita (id),
  constraint receita_tag_id_fkey foreign key (tag_id) references public.tags (id) on delete set null
);

-- 5. Despesas
create table public.despesa (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  categoria_id uuid,
  nome text not null,
  descricao text,
  valor numeric not null,
  data_transacao timestamp with time zone not null default now(),
  pago boolean default false,
  created_at timestamp with time zone default now(),
  parcela_atual integer default 1,
  parcela_total integer default 1,
  grupo_id uuid default gen_random_uuid(),
  tag_id uuid,
  constraint despesa_pkey primary key (id),
  constraint despesa_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint despesa_categoria_id_fkey foreign key (categoria_id) references public.categoria_despesa (id),
  constraint despesa_tag_id_fkey foreign key (tag_id) references public.tags (id) on delete set null
);

-- Índices para performance
create index idx_receita_user on public.receita (user_id);
create index idx_despesa_user on public.despesa (user_id);
create index idx_receita_data on public.receita (data_transacao);
create index idx_despesa_data on public.despesa (data_transacao);
-- Índice útil para buscar todas as parcelas de uma mesma compra
create index idx_despesa_grupo on public.despesa (grupo_id);
-- Índice para tags por usuário
create index idx_tags_user on public.tags (user_id);
