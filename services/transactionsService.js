import { supabase } from "../lib/supabase";

const TABLES = {
  income: "receita",
  expense: "despesa",
};

function toTransaction(row, type) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.nome,
    description: row.descricao,
    amount: Number(row.valor),
    date: row.data_transacao,
    settled: type === "income" ? row.recebido : row.pago,
    installmentCurrent: row.parcela_atual,
    installmentTotal: row.parcela_total,
    groupId: row.grupo_id,
    tagId: row.tag_id,
    createdAt: row.created_at,
    type,
  };
}

function toRow(transaction, type) {
  const row = {};
  if (transaction.userId !== undefined) row.user_id = transaction.userId;
  if (transaction.name !== undefined) row.nome = transaction.name;
  if (transaction.description !== undefined)
    row.descricao = transaction.description;
  if (transaction.amount !== undefined) row.valor = transaction.amount;
  if (transaction.date !== undefined) row.data_transacao = transaction.date;
  if (transaction.settled !== undefined) {
    if (type === "income") row.recebido = transaction.settled;
    else row.pago = transaction.settled;
  }
  if (transaction.installmentCurrent !== undefined)
    row.parcela_atual = transaction.installmentCurrent;
  if (transaction.installmentTotal !== undefined)
    row.parcela_total = transaction.installmentTotal;
  if (transaction.groupId !== undefined) row.grupo_id = transaction.groupId;
  if (transaction.tagId !== undefined) row.tag_id = transaction.tagId;
  return row;
}

async function getByType(type, userId, filters = {}) {
  let query = supabase.from(TABLES[type]).select("*").eq("user_id", userId);

  if (filters.startISO) query = query.gte("data_transacao", filters.startISO);
  if (filters.endISO) query = query.lte("data_transacao", filters.endISO);
  if (filters.tagId) query = query.eq("tag_id", filters.tagId);

  const { data, error } = await query.order("data_transacao", {
    ascending: false,
  });

  return { data: (data || []).map((row) => toTransaction(row, type)), error };
}

// Lista receitas e despesas do período/tag, já mescladas e ordenadas por data.
export async function getTransactions(userId, filters = {}) {
  const [incomes, expenses] = await Promise.all([
    getByType("income", userId, filters),
    getByType("expense", userId, filters),
  ]);

  if (incomes.error) return { data: [], error: incomes.error };
  if (expenses.error) return { data: [], error: expenses.error };

  const merged = [...incomes.data, ...expenses.data].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return { data: merged, error: null };
}

// Soma receitas e despesas do período/tag.
export async function getSums(userId, filters = {}) {
  const [incomes, expenses] = await Promise.all([
    getByType("income", userId, filters),
    getByType("expense", userId, filters),
  ]);

  if (incomes.error) return { data: null, error: incomes.error };
  if (expenses.error) return { data: null, error: expenses.error };

  const income = incomes.data.reduce((acc, item) => acc + item.amount, 0);
  const expense = expenses.data.reduce((acc, item) => acc + item.amount, 0);

  return { data: { income, expense, balance: income - expense }, error: null };
}

export async function createTransaction(type, transaction) {
  const { data, error } = await supabase
    .from(TABLES[type])
    .insert(toRow(transaction, type))
    .select()
    .single();

  return { data: toTransaction(data, type), error };
}

export async function createTransactions(type, transactions) {
  const rows = transactions.map((transaction) => toRow(transaction, type));
  const { data, error } = await supabase
    .from(TABLES[type])
    .insert(rows)
    .select();

  return { data: (data || []).map((row) => toTransaction(row, type)), error };
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
  const { error } = await supabase.from(TABLES[type]).delete().eq("id", id);
  return { data: null, error };
}
