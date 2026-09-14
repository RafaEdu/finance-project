import { parseCurrency, formatAmountInput, formatCurrency } from "../currency";

describe("parseCurrency", () => {
  it("retorna 0 para entradas vazias", () => {
    expect(parseCurrency("")).toBe(0);
    expect(parseCurrency(undefined)).toBe(0);
    expect(parseCurrency(null)).toBe(0);
  });

  it("interpreta os dígitos como centavos", () => {
    expect(parseCurrency("1")).toBe(0.01);
    expect(parseCurrency("1.234,56")).toBe(1234.56);
    expect(parseCurrency("R$ 10,00")).toBe(10);
  });

  it("ignora caracteres não numéricos", () => {
    expect(parseCurrency("abc12")).toBe(0.12);
  });
});

describe("formatAmountInput", () => {
  it("retorna string vazia para null/undefined", () => {
    expect(formatAmountInput(null)).toBe("");
    expect(formatAmountInput(undefined)).toBe("");
  });

  it("formata com duas casas e vírgula", () => {
    expect(formatAmountInput(1234.56)).toBe("1234,56");
    expect(formatAmountInput(10)).toBe("10,00");
  });
});

describe("formatCurrency", () => {
  it("formata valores em BRL", () => {
    expect(formatCurrency(1234.56).replace(/\u00a0/g, " ")).toBe("R$ 1.234,56");
  });

  it("trata valores falsy como zero", () => {
    expect(formatCurrency(0).replace(/\u00a0/g, " ")).toBe("R$ 0,00");
    expect(formatCurrency(null).replace(/\u00a0/g, " ")).toBe("R$ 0,00");
  });
});
