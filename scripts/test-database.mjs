import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const a = "10000000-0000-4000-8000-000000000001";
const b = "20000000-0000-4000-8000-000000000002";
const tagA = "30000000-0000-4000-8000-000000000003";
const tagB = "40000000-0000-4000-8000-000000000004";
let count = 0;
async function check(name, fn) {
  await fn();
  count++;
  console.log(`OK ${name}`);
}
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select current_user::text $$;
    grant usage on schema public, auth to authenticated, anon;
    create table storage.buckets(id text primary key,name text,public boolean);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,owner uuid);
    alter table storage.objects enable row level security;`);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  await db.exec(`insert into auth.users values('${a}'),('${b}');
    insert into public.tags(id,user_id,nome) values('${tagA}','${a}','Alimentação'),('${tagB}','${b}','Privada');
    insert into public.receita(user_id,nome,valor,recebido,data_transacao) values
    ('${a}','Salário',1000,true,'2026-10-01T12:00:00Z'),('${a}','Extra',200,false,'2026-10-01T12:00:00Z');
    insert into public.despesa(user_id,nome,descricao,valor,pago,data_transacao,tag_id)
    select '${a}', 'Despesa '||n, case when n=1 then 'Café e pão' else '' end,1,n<=1000,'2026-10-02T12:00:00Z'::timestamptz + n*interval '1 second','${tagA}'::uuid from generate_series(1,1205) n;
    insert into public.despesa(user_id,nome,valor,data_transacao) values('${b}','Segredo',9000,'2026-10-02T12:00:00Z');
    set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
  const query = async (args = "") =>
    (await db.query(`select public.finance_query(${args}) as data`)).rows[0]
      .data;
  await check(
    "agregação cobre mais de 1000 linhas e distingue realizado",
    async () => {
      const result = await query();
      assert.equal(result.total, 1207);
      assert.equal(result.items.length, 30);
      assert.equal(result.summary.income, 1200);
      assert.equal(result.summary.expense, 1205);
      assert.equal(result.summary.balance, -5);
      assert.equal(result.summary.realized, 0);
      assert.equal(result.summary.pendingExpense, 205);
    },
  );
  await check(
    "paginação determinística sem repetição entre páginas",
    async () => {
      const first = await query("p_limit=>100");
      const second = await query("p_offset=>100,p_limit=>100");
      assert.equal(
        new Set([...first.items, ...second.items].map((x) => x.type + x.id))
          .size,
        200,
      );
      assert.equal(second.total, 1207);
    },
  );
  await check(
    "última página e página vazia mantêm totais completos",
    async () => {
      const last = await query("p_offset=>1200,p_limit=>30");
      assert.equal(last.items.length, 7);
      assert.equal(last.total, 1207);
      const empty = await query("p_offset=>1300");
      assert.equal(empty.items.length, 0);
      assert.equal(empty.summary.expense, 1205);
    },
  );
  await check("busca ignora acentos e exige todos os termos", async () => {
    assert.equal((await query("p_search=>'cafe pao'")).total, 1);
    assert.equal((await query("p_search=>'cafe ausente'")).total, 0);
  });
  await check(
    "tipo, status, tag e limites de período usam o mesmo escopo",
    async () => {
      const result = await query(
        `p_type=>'expense',p_settled=>false,p_tag=>'${tagA}'`,
      );
      assert.equal(result.total, 205);
      assert.equal(result.summary.expense, 205);
      const empty = await query("p_end=>'2026-10-01T12:00:00Z'");
      assert.equal(empty.total, 0);
    },
  );
  await check(
    "relatórios agregam categorias e meses sem depender da página",
    async () => {
      const result = await query("p_limit=>0");
      assert.equal(result.items.length, 0);
      assert.equal(result.categories[0].amount, 1205);
      assert.equal(result.months[0].expense, 1205);
    },
  );
  await check(
    "usuário A não lê, altera ou apaga registros do usuário B",
    async () => {
      assert.equal(
        (
          await db.query(
            `select * from public.finance_entries where user_id='${b}'`,
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            `update public.despesa set nome='Alterado' where user_id='${b}' returning id`,
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            `delete from public.despesa where user_id='${b}' returning id`,
          )
        ).rows.length,
        0,
      );
    },
  );
  await check("RLS rejeita criar lançamento de outro usuário", async () => {
    await assert.rejects(
      db.query(
        `insert into public.despesa(user_id,nome,valor) values('${b}','Invasão',1)`,
      ),
      /row-level security/i,
    );
  });
  await check("FK composta rejeita tag de outro usuário", async () => {
    await assert.rejects(
      db.query(
        `insert into public.despesa(user_id,nome,valor,tag_id) values('${a}','Teste',1,'${tagB}')`,
      ),
      /foreign key/i,
    );
  });
  await check(
    "constraints rejeitam zero, valor fracionário e parcelas inválidas",
    async () => {
      for (const amount of [0, -1, 1.001])
        await assert.rejects(
          db.query(
            `insert into public.despesa(user_id,nome,valor) values('${a}','Teste',${amount})`,
          ),
          /check constraint/i,
        );
      await assert.rejects(
        db.query(
          `insert into public.despesa(user_id,nome,valor,parcela_atual,parcela_total) values('${a}','Teste',1,3,2)`,
        ),
        /check constraint/i,
      );
    },
  );
  await check(
    "reenvio com o mesmo ID não duplica nem sobrescreve",
    async () => {
      const id = "50000000-0000-4000-8000-000000000005";
      await db.exec(`insert into public.receita(id,user_id,nome,valor) values('${id}','${a}','Idempotente',10) on conflict(id) do nothing;
      insert into public.receita(id,user_id,nome,valor) values('${id}','${a}','Alterado',99) on conflict(id) do nothing;`);
      const row = (
        await db.query(`select nome,valor from public.receita where id='${id}'`)
      ).rows[0];
      assert.equal(row.nome, "Idempotente");
      assert.equal(Number(row.valor), 10);
    },
  );
  await check("excluir tag preserva lançamentos e usuário", async () => {
    await db.exec(`delete from public.tags where id='${tagA}'`);
    const result = await query("p_type=>'expense'");
    assert.equal(result.total, 1205);
    assert.equal(result.items[0].tag_id, null);
    assert.equal(result.items[0].user_id, a);
  });
  await check("usuário B recebe somente seus próprios totais", async () => {
    await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);
    const result = await query();
    assert.equal(result.total, 1);
    assert.equal(result.summary.expense, 9000);
  });
  await check("anônimo não executa a RPC nem lê a view", async () => {
    await db.exec("reset role; set role anon;");
    await assert.rejects(query(), /permission denied/i);
    await assert.rejects(
      db.query("select * from public.finance_entries"),
      /permission denied/i,
    );
  });
  console.log(`${count} verificações de banco passaram.`);
} finally {
  await db.close();
}
