// Retorna o intervalo (início/fim) em ISO para os filtros de dia, mês ou ano.
export function getDateRange(date, type) {
  const start = new Date(date);
  const end = new Date(date);

  if (type === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (type === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else if (type === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
}

// Exibe a data conforme o tipo de filtro (dia, mês ou ano).
export function formatDisplayDate(date, type) {
  if (type === "day") return date.toLocaleDateString("pt-BR");
  if (type === "month")
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  if (type === "year") return date.getFullYear().toString();
}

// Exibe uma data ISO no formato brasileiro (dd/mm/aaaa).
export function formatTransactionDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR");
}

// Exibe um objeto Date no formato brasileiro (dd/mm/aaaa).
export function formatDateBR(date) {
  return date.toLocaleDateString("pt-BR");
}

// Navega a data para frente/trás conforme o tipo de filtro.
export function changeDate(date, type, direction) {
  const newDate = new Date(date);
  if (type === "day") newDate.setDate(newDate.getDate() + direction);
  else if (type === "month") newDate.setMonth(newDate.getMonth() + direction);
  else if (type === "year")
    newDate.setFullYear(newDate.getFullYear() + direction);
  return newDate;
}
