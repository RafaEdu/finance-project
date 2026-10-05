import { supabase } from "../../lib/supabase";
import { queryFinance, createTransactions } from "../transactionsService";
jest.mock("../../lib/supabase", () => ({
  supabase: { rpc: jest.fn(), from: jest.fn() },
}));
beforeEach(() => jest.clearAllMocks());
it("mantém totais do servidor independentes da página e normaliza registros", async () => {
  supabase.rpc.mockResolvedValue({
    data: {
      total: 1200,
      summary: { expense: 1200 },
      items: [{ id: "a", type: "expense", valor: "1.00", pago: true }],
    },
    error: null,
  });
  const result = await queryFinance(
    {
      endISO: "2026-10-31T23:59:59.999Z",
      status: "pending",
      type: "expense",
      search: " café ",
    },
    { offset: 30, limit: 30 },
  );
  expect(result.data.total).toBe(1200);
  expect(result.data.summary.expense).toBe(1200);
  expect(result.data.items[0].amount).toBe(1);
  expect(supabase.rpc).toHaveBeenCalledWith(
    "finance_query",
    expect.objectContaining({
      p_end: "2026-11-01T00:00:00.000Z",
      p_settled: false,
      p_offset: 30,
      p_search: "café",
    }),
  );
});
it("não transforma falha da RPC em saldo zero", async () => {
  const error = { message: "offline" };
  supabase.rpc.mockResolvedValue({ data: null, error });
  expect(await queryFinance()).toEqual({ data: null, error });
});
it("reutiliza IDs e não sobrescreve um envio já confirmado pelo banco", async () => {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  supabase.from.mockReturnValue({ upsert });
  const rows = [
    {
      id: "stable-id",
      userId: "owner",
      amount: 15,
      settled: false,
      name: "Compra",
    },
  ];
  await createTransactions("expense", rows);
  await createTransactions("expense", rows);
  expect(upsert).toHaveBeenNthCalledWith(
    2,
    [
      {
        id: "stable-id",
        user_id: "owner",
        valor: 15,
        pago: false,
        nome: "Compra",
      },
    ],
    { onConflict: "id", ignoreDuplicates: true },
  );
});
it("rejeita criação sem identificador antes de chamar o banco", async () => {
  expect(
    (await createTransactions("expense", [{ amount: 10 }])).error,
  ).toBeTruthy();
  expect(supabase.from).not.toHaveBeenCalled();
});
