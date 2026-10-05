import { supabase } from "../lib/supabase";
const TABLES = { income: "receita", expense: "despesa" };
export function toTransaction(row, type = row?.type) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.nome,
    description: row.descricao,
    amount: Number(row.valor),
    date: row.data_transacao,
    settled:
      row.settled ?? (type === "income" ? row.recebido : row.pago) ?? false,
    installmentCurrent: row.parcela_atual,
    installmentTotal: row.parcela_total,
    groupId: row.grupo_id,
    tagId: row.tag_id,
    createdAt: row.created_at,
    entryKind:
      row.entry_kind ||
      (row.parcela_total > 1
        ? type === "income"
          ? "recurring"
          : "installment"
        : "single"),
    type,
  };
}
function toRow(transaction, type) {
  const fields = {
    id: "id",
    userId: "user_id",
    name: "nome",
    description: "descricao",
    amount: "valor",
    date: "data_transacao",
    installmentCurrent: "parcela_atual",
    installmentTotal: "parcela_total",
    groupId: "grupo_id",
    tagId: "tag_id",
    entryKind: "entry_kind",
  };
  const row = {};
  Object.entries(fields).forEach(([key, column]) => {
    if (transaction[key] !== undefined) row[column] = transaction[key];
  });
  if (transaction.settled !== undefined)
    row[type === "income" ? "recebido" : "pago"] = transaction.settled;
  return row;
}
// Totais/contagem são agregados sobre TODO o filtro no banco, não sobre a página.
export async function queryFinance(
  filters = {},
  { offset = 0, limit = 30 } = {},
) {
  const { data, error } = await supabase.rpc("finance_query", {
    p_start: filters.startISO || null,
    p_end: filters.endISO
      ? new Date(new Date(filters.endISO).getTime() + 1).toISOString()
      : null,
    p_tag: filters.tagId || null,
    p_type: filters.type && filters.type !== "all" ? filters.type : null,
    p_settled:
      filters.status === "settled"
        ? true
        : filters.status === "pending"
          ? false
          : null,
    p_search: filters.search?.trim() || "",
    p_offset: offset,
    p_limit: limit,
    p_timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
  });
  if (error) return { data: null, error };
  return {
    data: {
      ...data,
      items: (data?.items || []).map((row) => toTransaction(row)),
    },
    error: null,
  };
}
export async function getTransactions(_userId, filters = {}) {
  const { data, error } = await queryFinance(filters);
  return { data: data?.items || [], error };
}
export async function getSums(_userId, filters = {}) {
  const { data, error } = await queryFinance(filters, { limit: 0 });
  return { data: data?.summary || null, error };
}
// IDs estáveis do formulário tornam uma tentativa repetida idempotente.
export async function createTransactions(type, transactions) {
  if (!TABLES[type] || transactions.some((item) => !item.id))
    return {
      data: null,
      error: new Error("Lançamento sem identificador válido."),
    };
  const { error } = await supabase.from(TABLES[type]).upsert(
    transactions.map((item) => toRow(item, type)),
    { onConflict: "id", ignoreDuplicates: true },
  );
  return { data: null, error };
}
export function createTransaction(type, transaction) {
  return createTransactions(type, [transaction]);
}
export async function updateTransaction(type, id, changes) {
  const { data, error } = await supabase
    .from(TABLES[type])
    .update(toRow(changes, type))
    .eq("id", id)
    .select()
    .single();
  return { data: toTransaction(data, type), error };
}
export async function deleteTransaction(type, id) {
  const { data, error } = await supabase
    .from(TABLES[type])
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { data: null, error };
  return {
    data: null,
    error: data?.length
      ? null
      : new Error("Este lançamento já foi removido ou não está disponível."),
  };
}
