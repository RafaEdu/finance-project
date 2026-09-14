-- =============================================================================
-- Migration: storage_avatars
-- Cria o bucket público de avatares e as políticas de acesso ao storage.
--
-- Observação: em alguns projetos o insert direto em storage.buckets pode exigir
-- privilégio elevado. Se falhar, crie o bucket 'avatars' (público) pela interface
-- do Supabase e rode apenas as políticas abaixo.
-- =============================================================================

-- Bucket de avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Leitura pública dos avatares
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Upload permitido apenas para usuários autenticados
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Atualização permitida apenas pelo dono do arquivo
create policy "Anyone can update their own avatar"
  on storage.objects for update
  using (auth.uid() = owner)
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
