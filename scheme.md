-- =========================================================
-- CRIAÇÃO DAS PRIMEIRAS TABELAS
-- =========================================================

-- 1. Tabela de Categorias de Receita
create table public.categoria_receita (
id uuid not null default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
nome text not null,
icone text,
created_at timestamptz default now(),

-- Constraints
primary key (id),
unique (user_id, nome)
);

-- 2. Tabela de Categorias de Despesa
create table public.categoria_despesa (
id uuid not null default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
nome text not null,
icone text,
created_at timestamptz default now(),

primary key (id),
unique (user_id, nome)
);

-- 3. Tabela de Receitas
create table public.receita (
id uuid not null default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
categoria_id uuid references public.categoria_receita(id) on delete set null
descricao text not null,
valor numeric(12, 2) not null, -- Até 12 dígitos, com 2 casas decimais
data_transacao timestamptz not null default now(),
recebido boolean default false, -- Para controlar se já caiu na conta ou é previsão
created_at timestamptz default now(),

primary key (id)
);

-- 4. Tabela de Despesas
create table public.despesa (
id uuid not null default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
categoria_id uuid references public.categoria_despesa(id) on delete set null,
descricao text not null,
valor numeric(12, 2) not null,
data_transacao timestamptz not null default now(),
pago boolean default false, -- Para controlar se já foi pago
created_at timestamptz default now(),

primary key (id)
);

-- Índices para performance
-- Como vai ser filtrado muito por user_id, criei índices para acelera as consultas
create index idx_receita_user on public.receita(user_id);
create index idx_despesa_user on public.despesa(user_id);
create index idx_receita_data on public.receita(data_transacao);
create index idx_despesa_data on public.despesa(data_transacao);

-- =========================================================
-- HABILITAR RLS (Segurança a nível de linha)
-- =========================================================

alter table public.categoria_receita enable row level security;
alter table public.categoria_despesa enable row level security;
alter table public.receita enable row level security;
alter table public.despesa enable row level security;

-- =========================================================
-- POLÍTICAS PARA CATEGORIA_RECEITA
-- =========================================================

-- Permitir SELECT apenas dos seus dados
create policy "Usuários podem ver suas próprias categorias de receita"
on public.categoria_receita for select
using (auth.uid() = user_id);

-- Permitir INSERT apenas se o user_id for o seu próprio
create policy "Usuários podem criar suas categorias de receita"
on public.categoria_receita for insert
with check (auth.uid() = user_id);

-- Permitir UPDATE apenas dos seus dados
create policy "Usuários podem editar suas categorias de receita"
on public.categoria_receita for update
using (auth.uid() = user_id);

-- Permitir DELETE apenas dos seus dados
create policy "Usuários podem deletar suas categorias de receita"
on public.categoria_receita for delete
using (auth.uid() = user_id);

-- =========================================================
-- POLÍTICAS PARA CATEGORIA_DESPESA
-- =========================================================

create policy "Usuários podem ver suas próprias categorias de despesa"
on public.categoria_despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar suas categorias de despesa"
on public.categoria_despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas categorias de despesa"
on public.categoria_despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas categorias de despesa"
on public.categoria_despesa for delete using (auth.uid() = user_id);

-- =========================================================
-- POLÍTICAS PARA RECEITA
-- =========================================================

create policy "Usuários podem ver suas próprias receitas"
on public.receita for select using (auth.uid() = user_id);

create policy "Usuários podem criar receitas"
on public.receita for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas receitas"
on public.receita for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas receitas"
on public.receita for delete using (auth.uid() = user_id);

-- =========================================================
-- POLÍTICAS PARA DESPESA
-- =========================================================

create policy "Usuários podem ver suas próprias despesas"
on public.despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar despesas"
on public.despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas despesas"
on public.despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas despesas"
on public.despesa for delete using (auth.uid() = user_id);
