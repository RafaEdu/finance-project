-- =============================================================================
-- Migration: enable_rls_and_policies
-- Habilita Row Level Security e cria as políticas de acesso por usuário.
-- Cada usuário só enxerga e altera os próprios registros (auth.uid() = user_id).
-- =============================================================================

-- Habilitar RLS
alter table public.categoria_receita enable row level security;
alter table public.categoria_despesa enable row level security;
alter table public.receita enable row level security;
alter table public.despesa enable row level security;
alter table public.tags enable row level security;

-- Políticas: tags
create policy "Usuários podem ver suas próprias tags"
  on public.tags for select using (auth.uid() = user_id);

create policy "Usuários podem criar suas tags"
  on public.tags for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas tags"
  on public.tags for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas tags"
  on public.tags for delete using (auth.uid() = user_id);

-- Políticas: categoria_receita
create policy "Usuários podem ver suas próprias categorias de receita"
  on public.categoria_receita for select using (auth.uid() = user_id);

create policy "Usuários podem criar suas categorias de receita"
  on public.categoria_receita for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas categorias de receita"
  on public.categoria_receita for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas categorias de receita"
  on public.categoria_receita for delete using (auth.uid() = user_id);

-- Políticas: categoria_despesa
create policy "Usuários podem ver suas próprias categorias de despesa"
  on public.categoria_despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar suas categorias de despesa"
  on public.categoria_despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas categorias de despesa"
  on public.categoria_despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas categorias de despesa"
  on public.categoria_despesa for delete using (auth.uid() = user_id);

-- Políticas: receita
create policy "Usuários podem ver suas próprias receitas"
  on public.receita for select using (auth.uid() = user_id);

create policy "Usuários podem criar receitas"
  on public.receita for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas receitas"
  on public.receita for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas receitas"
  on public.receita for delete using (auth.uid() = user_id);

-- Políticas: despesa
create policy "Usuários podem ver suas próprias despesas"
  on public.despesa for select using (auth.uid() = user_id);

create policy "Usuários podem criar despesas"
  on public.despesa for insert with check (auth.uid() = user_id);

create policy "Usuários podem editar suas despesas"
  on public.despesa for update using (auth.uid() = user_id);

create policy "Usuários podem deletar suas despesas"
  on public.despesa for delete using (auth.uid() = user_id);
