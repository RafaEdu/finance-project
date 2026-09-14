import { normalizeDescription, removeAccents } from "../string";

describe("normalizeDescription", () => {
  it("retorna null para vazio ou apenas espaços", () => {
    expect(normalizeDescription("")).toBeNull();
    expect(normalizeDescription("   ")).toBeNull();
    expect(normalizeDescription(null)).toBeNull();
    expect(normalizeDescription(undefined)).toBeNull();
  });

  it("remove espaços nas pontas", () => {
    expect(normalizeDescription("  mercado  ")).toBe("mercado");
  });
});

describe("removeAccents", () => {
  it("remove acentos", () => {
    expect(removeAccents("Água Café ação")).toBe("Agua Cafe acao");
  });

  it("lida com entradas vazias", () => {
    expect(removeAccents("")).toBe("");
    expect(removeAccents(null)).toBe("");
  });
});
