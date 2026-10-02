import { addMonthsClamped } from "./date.js";

// Cada ocorrência parte da data original para não perder o dia após fevereiro.
export function buildInstallments({
  date,
  count,
  baseValue,
  different,
  previous = [],
}) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    date: addMonthsClamped(date, index),
    value: different && previous[index] ? previous[index].value : baseValue,
  }));
}

export function hasValidInstallments(items, count) {
  return (
    items.length === count &&
    items.every((item) => Number.isFinite(item.value) && item.value > 0)
  );
}
