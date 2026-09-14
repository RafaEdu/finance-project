// Converte o texto digitado em moeda para número.
// Ex.: "1.234,56" -> 1234.56
export function parseCurrency(text) {
  if (!text) return 0;
  const clean = String(text).replace(/\D/g, "");
  return Number(clean) / 100;
}

// Formata número para edição em input, sem símbolo de moeda.
// Ex.: 1234.56 -> "1234,56"
export function formatAmountInput(value) {
  if (value === undefined || value === null) return "";
  return Number(value).toFixed(2).replace(".", ",");
}

// Formata número como moeda brasileira para exibição.
// Ex.: 1234.56 -> "R$ 1.234,56"
export function formatCurrency(value) {
  return (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
