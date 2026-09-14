import {
  getDateRange,
  formatDisplayDate,
  formatTransactionDate,
  formatDateBR,
  changeDate,
} from "../date";

describe("getDateRange", () => {
  const base = new Date(2026, 0, 15, 12, 0, 0);

  it("dia: começa à meia-noite e termina no fim do dia", () => {
    const { startISO, endISO } = getDateRange(base, "day");
    const start = new Date(startISO);
    const end = new Date(endISO);

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getDate()).toBe(15);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getDate()).toBe(15);
  });

  it("mês: cobre o mês inteiro", () => {
    const { startISO, endISO } = getDateRange(base, "month");
    const start = new Date(startISO);
    const end = new Date(endISO);

    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(0);
    expect(end.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });

  it("ano: cobre o ano inteiro", () => {
    const { startISO, endISO } = getDateRange(base, "year");
    const start = new Date(startISO);
    const end = new Date(endISO);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe("formatDisplayDate", () => {
  const date = new Date(2026, 0, 15);

  it("dia -> dd/mm/aaaa", () => {
    expect(formatDisplayDate(date, "day")).toBe("15/01/2026");
  });

  it("mês -> nome do mês e ano", () => {
    expect(formatDisplayDate(date, "month")).toMatch(/janeiro de 2026/i);
  });

  it("ano -> ano", () => {
    expect(formatDisplayDate(date, "year")).toBe("2026");
  });
});

describe("formatTransactionDate", () => {
  it("formata data ISO em pt-BR", () => {
    expect(formatTransactionDate("2026-01-15T12:00:00.000Z")).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/,
    );
  });

  it("retorna vazio quando não há data", () => {
    expect(formatTransactionDate(null)).toBe("");
    expect(formatTransactionDate("")).toBe("");
  });
});

describe("formatDateBR", () => {
  it("formata um objeto Date em pt-BR", () => {
    expect(formatDateBR(new Date(2026, 0, 15))).toBe("15/01/2026");
  });
});

describe("changeDate", () => {
  const date = new Date(2026, 0, 15);

  it("avança e retrocede o dia", () => {
    expect(changeDate(date, "day", 1).getDate()).toBe(16);
    expect(changeDate(date, "day", -1).getDate()).toBe(14);
  });

  it("avança o mês", () => {
    expect(changeDate(date, "month", 1).getMonth()).toBe(1);
  });

  it("avança o ano", () => {
    expect(changeDate(date, "year", 1).getFullYear()).toBe(2027);
  });

  it("não muta a data original", () => {
    const original = date.getTime();
    changeDate(date, "year", 5);
    expect(date.getTime()).toBe(original);
  });
});
