import { getContrastTextColor, isValidHex } from "../color";

describe("getContrastTextColor", () => {
  it("retorna preto para cores claras", () => {
    expect(getContrastTextColor("#ffffff")).toBe("#000000");
    expect(getContrastTextColor("#f1c40f")).toBe("#000000");
  });

  it("retorna branco para cores escuras", () => {
    expect(getContrastTextColor("#000000")).toBe("#ffffff");
    expect(getContrastTextColor("#2c3e50")).toBe("#ffffff");
  });

  it("usa branco como fallback para hex inválido", () => {
    expect(getContrastTextColor("xyz")).toBe("#ffffff");
    expect(getContrastTextColor(null)).toBe("#ffffff");
  });
});

describe("isValidHex", () => {
  it("aceita o formato #RRGGBB", () => {
    expect(isValidHex("#2980b9")).toBe(true);
    expect(isValidHex("#ABC123")).toBe(true);
  });

  it("rejeita formatos inválidos", () => {
    expect(isValidHex("2980b9")).toBe(false);
    expect(isValidHex("#fff")).toBe(false);
    expect(isValidHex("#gggggg")).toBe(false);
  });
});
