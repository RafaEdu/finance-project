// Normaliza a descrição: vazio ou apenas espaços vira null.
export function normalizeDescription(value) {
  const trimmed = (value || "").trim();
  return trimmed === "" ? null : trimmed;
}

// Remove acentos de uma string (usado na busca de movimentações).
export function removeAccents(value) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
