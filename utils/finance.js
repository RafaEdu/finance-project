export function splitAmount(total, count) {
  const cents = Math.round((Number(total) + Number.EPSILON) * 100);
  if (
    !Number.isSafeInteger(cents) ||
    !Number.isInteger(count) ||
    count < 1 ||
    cents < count
  ) {
    throw new Error("O total precisa permitir pelo menos R$ 0,01 por parcela.");
  }
  const base = Math.floor(cents / count);
  return Array.from(
    { length: count },
    (_, i) => (base + (i < cents % count ? 1 : 0)) / 100,
  );
}
export function percentageChange(current, previous) {
  return previous ? ((current - previous) / Math.abs(previous)) * 100 : null;
}
export function createRequestGuard() {
  let version = 0;
  return {
    next: () => ++version,
    isCurrent: (id) => id === version,
    invalidate: () => {
      version += 1;
    },
  };
}
export function getStatusLabel(transaction) {
  return transaction.type === "income"
    ? transaction.settled
      ? "Recebido"
      : "A receber"
    : transaction.settled
      ? "Pago"
      : "A pagar";
}
