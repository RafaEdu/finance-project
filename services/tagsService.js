import { supabase } from "../lib/supabase";

// Tradução dos campos do domínio (inglês) para as colunas do banco (pt-BR).
const ORDER_COLUMNS = {
  name: "nome",
  createdAt: "created_at",
};

function toTag(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.nome,
    color: row.cor,
    textColor: row.cor_texto,
    createdAt: row.created_at,
  };
}

function toRow(tag) {
  const row = {};
  if (tag.userId !== undefined) row.user_id = tag.userId;
  if (tag.name !== undefined) row.nome = tag.name;
  if (tag.color !== undefined) row.cor = tag.color;
  if (tag.textColor !== undefined) row.cor_texto = tag.textColor;
  return row;
}

export async function getTags(
  userId,
  { orderBy = "name", ascending = true } = {},
) {
  const column = ORDER_COLUMNS[orderBy] || ORDER_COLUMNS.name;
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order(column, { ascending });

  return { data: (data || []).map(toTag), error };
}

export async function createTag(userId, tag) {
  const { data, error } = await supabase
    .from("tags")
    .insert(toRow({ ...tag, userId }))
    .select()
    .single();

  return { data: toTag(data), error };
}

export async function updateTag(id, changes) {
  const { data, error } = await supabase
    .from("tags")
    .update(toRow(changes))
    .eq("id", id)
    .select()
    .single();

  return { data: toTag(data), error };
}

export async function deleteTag(id) {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  return { data: null, error };
}
