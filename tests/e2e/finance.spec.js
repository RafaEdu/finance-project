const { Buffer } = require("node:buffer");
const { test, expect } = require("@playwright/test");
const USER = "10000000-0000-4000-8000-000000000001";
const TAG = "20000000-0000-4000-8000-000000000002";
const now = new Date();
const date = (day) =>
  new Date(now.getFullYear(), now.getMonth(), day, 12).toISOString();
function session() {
  const encode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token: `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: USER, exp, aud: "authenticated", role: "authenticated" })}.test`,
    refresh_token: "test-refresh",
    expires_at: exp,
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: USER,
      email: "rafael@example.test",
      aud: "authenticated",
      role: "authenticated",
      user_metadata: { full_name: "Rafael" },
      created_at: date(1),
    },
  };
}
async function setup(page, { signedIn = true } = {}) {
  const auth = session();
  let items = [
    {
      id: "salary",
      type: "income",
      nome: "Salário",
      valor: 5200,
      settled: true,
      data_transacao: date(1),
    },
    ...Array.from({ length: 34 }, (_, i) => ({
      id: `expense-${i}`,
      type: "expense",
      nome: i === 0 ? "Mercado" : `Compra ${i}`,
      valor: i === 0 ? 186.4 : 10,
      settled: i < 30,
      data_transacao: date(i === 0 ? 3 : 2),
      tag_id: TAG,
    })),
  ].map((item) => ({
    ...item,
    user_id: USER,
    descricao: "",
    parcela_atual: 1,
    parcela_total: 1,
    entry_kind: "single",
    created_at: date(1),
  }));
  let failQueries = false;
  const writes = [];
  await page.addInitScript(
    ({ auth, signedIn }) => {
      if (signedIn)
        localStorage.setItem(
          "sb-finance-test-auth-token",
          JSON.stringify(auth),
        );
      localStorage.setItem(`@finance/values-visible/${auth.user.id}`, "true");
    },
    { auth, signedIn },
  );
  await page.route("https://finance-test.supabase.co/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 200,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
        },
      });
      return;
    }
    const json = async (body, status = 200, headers = {}) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*", ...headers },
        body: JSON.stringify(body),
      });
    if (url.pathname.includes("/auth/v1/verify")) return json(auth);
    if (url.pathname.includes("/auth/v1/user")) return json(auth.user);
    if (url.pathname.includes("/auth/v1/recover")) return json({});
    if (url.pathname.includes("/rest/v1/tags"))
      return json(
        [
          {
            id: TAG,
            user_id: USER,
            nome: "Alimentação",
            cor: "#4F46E5",
            cor_texto: "#ffffff",
          },
        ],
        200,
        { "content-range": "0-0/1" },
      );
    if (url.pathname.includes("/rpc/finance_query")) {
      if (failQueries) return json({ message: "offline", code: "TEST" }, 503);
      const p = request.postDataJSON();
      const selected = items
        .filter(
          (item) =>
            (!p.p_type || p.p_type === item.type) &&
            (p.p_settled === null || p.p_settled === item.settled) &&
            (!p.p_tag || p.p_tag === item.tag_id) &&
            (!p.p_start || item.data_transacao >= p.p_start) &&
            (!p.p_end || item.data_transacao < p.p_end) &&
            (!p.p_search ||
              item.nome.toLowerCase().includes(p.p_search.toLowerCase())),
        )
        .sort(
          (a, b) =>
            b.data_transacao.localeCompare(a.data_transacao) ||
            a.id.localeCompare(b.id),
        );
      const sum = (type, settled) =>
        selected
          .filter(
            (x) =>
              x.type === type &&
              (settled === undefined || x.settled === settled),
          )
          .reduce((n, x) => n + Number(x.valor), 0);
      const income = sum("income"),
        expense = sum("expense"),
        received = sum("income", true),
        paid = sum("expense", true);
      return json({
        total: selected.length,
        summary: {
          income,
          expense,
          balance: income - expense,
          received,
          paid,
          realized: received - paid,
          pendingIncome: income - received,
          pendingExpense: expense - paid,
        },
        items: selected.slice(p.p_offset, p.p_offset + p.p_limit),
        categories: expense
          ? [{ tag_id: TAG, tag_name: "Alimentação", amount: expense }]
          : [],
        months: selected.length
          ? [
              {
                month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
                income,
                expense,
              },
            ]
          : [],
      });
    }
    if (/\/rest\/v1\/(receita|despesa)/.test(url.pathname)) {
      const type = url.pathname.endsWith("receita") ? "income" : "expense";
      const payload = request.postDataJSON();
      writes.push(payload);
      if (request.method() === "POST") {
        for (const row of payload) {
          if (!items.some((x) => x.id === row.id))
            items.push({ ...row, type, settled: row.pago ?? row.recebido });
        }
        return route.fulfill({ status: 201, body: "" });
      }
      if (request.method() === "PATCH") {
        const id = url.searchParams.get("id").replace("eq.", "");
        items = items.map((x) =>
          x.id === id
            ? {
                ...x,
                ...payload,
                settled: payload.pago ?? payload.recebido ?? x.settled,
              }
            : x,
        );
        return json(items.find((x) => x.id === id));
      }
      return json([]);
    }
    return json({});
  });
  await page.goto("/");
  return {
    writes,
    setFailure: (value) => {
      failQueries = value;
    },
  };
}

test("Essencial: privacidade, navegação, busca e paginação", async ({
  page,
}) => {
  await setup(page);
  await expect(page.getByText("Resultado previsto do período")).toBeVisible();
  await page
    .getByRole("button", { name: "Ocultar valores", exact: true })
    .click();
  await expect(page.getByLabel("Valor oculto").first()).toBeVisible();
  await expect(page.getByText("R$ 5.200,00", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Mostrar valores", exact: true })
    .click();
  await page.getByText("Ver todas", { exact: true }).click();
  await expect(
    page.getByText("35 resultado(s) em todo o filtro"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Carregar mais", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Carregar mais", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Pesquisar movimentações").fill("Mercado");
  await expect(page.getByText("1 resultado(s) em todo o filtro")).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click();
  await expect(
    page.getByText("35 resultado(s) em todo o filtro"),
  ).toBeVisible();
});

test("formulário preserva rascunho nas tags e salva parcelas com centavos e datas corretos", async ({
  page,
}) => {
  const state = await setup(page);
  await page
    .getByRole("button", { name: "＋ Novo lançamento", exact: true })
    .click();
  await page.getByLabel("Nome", { exact: true }).fill("Notebook");
  await page.getByLabel("Valor (R$)", { exact: true }).fill("10000");
  await page
    .getByRole("button", { name: "Gerenciar tags", exact: true })
    .click();
  await expect(page.getByText("Minhas tags", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(
    "Notebook",
  );
  await page.getByLabel("Data prevista", { exact: true }).fill("2026-01-31");
  await page.getByRole("button", { name: "Parcelada", exact: true }).click();
  await page.getByLabel("Quantidade (2 a 48)").fill("3");
  await page
    .getByRole("button", { name: "Valor total da compra", exact: true })
    .click();
  await expect(page.getByText("Total: R$ 100,00")).toBeVisible();
  await page
    .getByRole("button", { name: "Salvar lançamento", exact: true })
    .click();
  await expect(page.getByText("Resultado previsto do período")).toBeVisible();
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0].map((x) => x.valor)).toEqual([33.34, 33.33, 33.33]);
  expect(state.writes[0].map((x) => x.data_transacao.slice(0, 10))).toEqual([
    "2026-01-31",
    "2026-02-28",
    "2026-03-31",
  ]);
});

test("falha da consulta tem tentativa novamente e não apresenta saldo zero", async ({
  page,
}) => {
  const state = await setup(page);
  await expect(page.getByText("Resultado previsto do período")).toBeVisible();
  state.setFailure(true);
  await page
    .getByRole("button", { name: "Próximo período", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tentar novamente", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Resultado previsto do período")).toHaveCount(0);
  state.setFailure(false);
  await page
    .getByRole("button", { name: "Tentar novamente", exact: true })
    .click();
  await expect(page.getByText("Resultado previsto do período")).toBeVisible();
});

test("recuperação exige definir a nova senha após verificar o código", async ({
  page,
}) => {
  await setup(page, { signedIn: false });
  await page
    .getByRole("button", { name: "Esqueci minha senha", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("rafael@example.test");
  await page
    .getByRole("button", { name: "Enviar código", exact: true })
    .click();
  await page
    .getByLabel("Código de verificação", { exact: true })
    .fill("123456");
  await page
    .getByRole("button", { name: "Confirmar código", exact: true })
    .click();
  await expect(
    page.getByText("Crie uma nova senha", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Nova senha", { exact: true })
    .fill("test-password-123");
  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("test-password-123");
  await page
    .getByRole("button", { name: "Salvar nova senha", exact: true })
    .click();
  await expect(page.getByText("Resultado previsto do período")).toBeVisible();
});

for (const width of [320, 360, 390, 430])
  test(`Início sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page);
    await expect(page.getByText("Resultado previsto do período")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const income = page.getByLabel("R$ 5.200,00", { exact: true }).first();
    const bounds = await income.boundingBox();
    expect(bounds.height).toBeLessThan(30);
    await expect(page.getByRole("tab", { name: /Movimentos/ })).toBeVisible();
    await page.screenshot({
      path: `test-results/essencial-${width}.png`,
      fullPage: true,
    });
  });
