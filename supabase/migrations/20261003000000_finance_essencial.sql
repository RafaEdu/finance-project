-- Essencial: agregados completos, paginação, tipo de série e integridade.
-- Requer PostgreSQL 15+ (Supabase). Não altera valores financeiros existentes.
begin;
alter table public.receita add column entry_kind text not null default 'single';
alter table public.despesa add column entry_kind text not null default 'single';
update public.receita set entry_kind = 'recurring' where parcela_total > 1;
update public.despesa set entry_kind = 'installment' where parcela_total > 1;

-- NOT VALID preserva dados legados para auditoria; novas escritas já são verificadas.
alter table public.receita add constraint receita_finance_valid check (
  valor > 0 and valor <= 999999999999.99 and valor = round(valor, 2)
  and length(btrim(nome)) > 0 and parcela_atual is not null and parcela_total is not null and parcela_atual >= 1
  and parcela_total >= parcela_atual and parcela_total <= 48
  and entry_kind in ('single', 'recurring', 'installment')
) not valid;
alter table public.despesa add constraint despesa_finance_valid check (
  valor > 0 and valor <= 999999999999.99 and valor = round(valor, 2)
  and length(btrim(nome)) > 0 and parcela_atual is not null and parcela_total is not null and parcela_atual >= 1
  and parcela_total >= parcela_atual and parcela_total <= 48
  and entry_kind in ('single', 'recurring', 'installment')
) not valid;
create unique index tags_owner_id_unique on public.tags(user_id, id);
create unique index categoria_receita_owner_id_unique on public.categoria_receita(user_id, id);
create unique index categoria_despesa_owner_id_unique on public.categoria_despesa(user_id, id);
alter table public.receita add constraint receita_tag_owner_fk foreign key(user_id, tag_id) references public.tags(user_id, id) on delete set null (tag_id) not valid;
alter table public.despesa add constraint despesa_tag_owner_fk foreign key(user_id, tag_id) references public.tags(user_id, id) on delete set null (tag_id) not valid;
alter table public.receita add constraint receita_categoria_owner_fk foreign key(user_id, categoria_id) references public.categoria_receita(user_id, id) not valid;
alter table public.despesa add constraint despesa_categoria_owner_fk foreign key(user_id, categoria_id) references public.categoria_despesa(user_id, id) not valid;
create index receita_user_date_id on public.receita(user_id, data_transacao desc, id);
create index despesa_user_date_id on public.despesa(user_id, data_transacao desc, id);

create view public.finance_entries with (security_invoker = true) as
select id, user_id, nome, descricao, valor, data_transacao, coalesce(recebido, false) as settled,
 parcela_atual, parcela_total, grupo_id, tag_id, created_at, entry_kind, 'income'::text as type
from public.receita
union all
select id, user_id, nome, descricao, valor, data_transacao, coalesce(pago, false),
 parcela_atual, parcela_total, grupo_id, tag_id, created_at, entry_kind, 'expense'::text
from public.despesa;
revoke all on public.finance_entries from public, anon;
grant select on public.finance_entries to authenticated;
grant select, insert, update, delete on public.receita, public.despesa, public.tags, public.categoria_receita, public.categoria_despesa to authenticated;

create function public.finance_search_text(value text) returns text
language sql immutable set search_path = '' as $$
 select translate(lower(coalesce(value, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc');
$$;

create function public.finance_query(
 p_start timestamptz default null, p_end timestamptz default null,
 p_tag uuid default null, p_type text default null, p_settled boolean default null,
 p_search text default '', p_offset integer default 0, p_limit integer default 30,
 p_timezone text default 'America/Sao_Paulo'
) returns jsonb language sql stable security invoker set search_path = '' as $$
with filtered as materialized (
 select e.*, coalesce(t.nome, 'Sem tag') as tag_name
 from public.finance_entries e left join public.tags t on t.id = e.tag_id and t.user_id = e.user_id
 where e.user_id = (select auth.uid())
 and (p_start is null or e.data_transacao >= p_start)
 and (p_end is null or e.data_transacao < p_end)
 and (p_tag is null or e.tag_id = p_tag)
 and (p_type is null or e.type = p_type)
 and (p_settled is null or e.settled = p_settled)
 and not exists (
   select 1 from regexp_split_to_table(btrim(public.finance_search_text(p_search)), '\s+') word
   where word <> '' and strpos(public.finance_search_text(e.nome || ' ' || coalesce(e.descricao, '') || ' ' || coalesce(t.nome, '')), word) = 0
 )
), totals as (
 select count(*) as total,
 coalesce(sum(valor) filter (where type='income'),0) as income,
 coalesce(sum(valor) filter (where type='expense'),0) as expense,
 coalesce(sum(valor) filter (where type='income' and settled),0) as received,
 coalesce(sum(valor) filter (where type='expense' and settled),0) as paid
 from filtered
), page as (
 select * from filtered order by data_transacao desc, created_at desc, type, id
 limit greatest(0, least(p_limit,100)) offset greatest(0,p_offset)
), categories as (
 select tag_id, tag_name, sum(valor) as amount from filtered where type='expense'
 group by tag_id, tag_name order by amount desc, tag_name
), months as (
 select to_char(data_transacao at time zone p_timezone, 'YYYY-MM') as month,
 coalesce(sum(valor) filter(where type='income'),0) as income,
 coalesce(sum(valor) filter(where type='expense'),0) as expense
 from filtered group by month order by month
)
select jsonb_build_object(
 'total', total,
 'summary', jsonb_build_object('income',income,'expense',expense,'balance',income-expense,
 'received',received,'paid',paid,'realized',received-paid,'pendingIncome',income-received,'pendingExpense',expense-paid),
 'items', coalesce((select jsonb_agg(to_jsonb(page) order by data_transacao desc, created_at desc, type, id) from page),'[]'::jsonb),
 'categories', coalesce((select jsonb_agg(to_jsonb(categories) order by amount desc, tag_name) from categories),'[]'::jsonb),
 'months', coalesce((select jsonb_agg(to_jsonb(months) order by month) from months),'[]'::jsonb)
) from totals;
$$;
revoke all on function public.finance_query(timestamptz,timestamptz,uuid,text,boolean,text,integer,integer,text) from public, anon;
grant execute on function public.finance_query(timestamptz,timestamptz,uuid,text,boolean,text,integer,integer,text) to authenticated;
commit;
