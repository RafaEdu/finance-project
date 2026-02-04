### =========================================================

### CRIAÇÃO DAS PRIMEIRAS TABELAS

### =========================================================

```sql
-- 1. Tabela de Categorias de Receita
CREATE TABLE public.categoria_receita (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  icone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categoria_receita_pkey PRIMARY KEY (id),
  CONSTRAINT categoria_receita_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 2. Tabela de Categorias de Despesa
CREATE TABLE public.categoria_despesa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  icone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categoria_despesa_pkey PRIMARY KEY (id),
  CONSTRAINT categoria_despesa_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. Tabela de Receitas
CREATE TABLE public.receita (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  categoria_id uuid,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_transacao timestamp with time zone NOT NULL DEFAULT now(),
  recebido boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  parcela_atual integer DEFAULT 1,
  parcela_total integer DEFAULT 1,
  grupo_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT receita_pkey PRIMARY KEY (id),
  CONSTRAINT receita_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT receita_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria_receita(id)
);

-- 4. Tabela de Despesas
CREATE TABLE public.despesa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  categoria_id uuid,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_transacao timestamp with time zone NOT NULL DEFAULT now(),
  pago boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  parcela_atual integer DEFAULT 1,
  parcela_total integer DEFAULT 1,
  grupo_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT despesa_pkey PRIMARY KEY (id),
  CONSTRAINT despesa_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT despesa_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria_despesa(id)
);

-- Índices para performance
-- Como vai ser filtrado muito por user_id, criei índices para acelera as consultas
create index idx_receita_user on public.receita(user_id);
create index idx_despesa_user on public.despesa(user_id);
create index idx_receita_data on public.receita(data_transacao);
create index idx_despesa_data on public.despesa(data_transacao);
-- Índice útil para buscar todas as parcelas de uma mesma compra
create index idx_despesa_grupo on public.despesa(grupo_id);
```

### =========================================================

### HABILITAR RLS (Segurança a nível de linha)

### =========================================================

```sql
alter table public.categoria_receita enable row level security;
alter table public.categoria_despesa enable row level security;
alter table public.receita enable row level security;
alter table public.despesa enable row level security;
```

### =========================================================

### POLÍTICAS PARA CATEGORIA_RECEITA

### =========================================================

```sql
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
```

### =========================================================

### POLÍTICAS PARA CATEGORIA_DESPESA

### =========================================================

```sql
create policy "Usuários podem ver suas próprias categorias de despesa"
on public.categoria_despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar suas categorias de despesa"
on public.categoria_despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas categorias de despesa"
on public.categoria_despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas categorias de despesa"
on public.categoria_despesa for delete using (auth.uid() = user_id);
```

### =========================================================

### POLÍTICAS PARA RECEITA

### =========================================================

```sql
create policy "Usuários podem ver suas próprias receitas"
on public.receita for select using (auth.uid() = user_id);

create policy "Usuários podem criar receitas"
on public.receita for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas receitas"
on public.receita for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas receitas"
on public.receita for delete using (auth.uid() = user_id);
```

### =========================================================

### POLÍTICAS PARA DESPESA

### =========================================================

```sql
create policy "Usuários podem ver suas próprias despesas"
on public.despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar despesas"
on public.despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas despesas"
on public.despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas despesas"
on public.despesa for delete using (auth.uid() = user_id);
```

### =========================================================

### STORAGE (AVATARS)

### =========================================================

```sql
-- 1. Criação do Bucket (caso não exista, tente criar via interface se der erro aqui)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Políticas de Segurança (RLS) para o Storage

-- Permitir acesso público para visualizar avatares
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Permitir upload apenas para usuários autenticados (na sua própria pasta)
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Permitir atualização do próprio avatar
create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
```
