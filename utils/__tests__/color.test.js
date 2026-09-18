import { getContrastTextColor, hexToHsv, hsvToHex, isValidHex } from "../color";
import { TAG_COLORS } from "../../constants/colors";

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

describe("hsvToHex", () => {
  it("converte cores primárias", () => {
    expect(hsvToHex(0, 1, 1)).toBe("#ff0000");
    expect(hsvToHex(120, 1, 1)).toBe("#00ff00");
    expect(hsvToHex(240, 1, 1)).toBe("#0000ff");
  });

  it("converte tons neutros", () => {
    expect(hsvToHex(0, 0, 1)).toBe("#ffffff");
    expect(hsvToHex(0, 0, 0)).toBe("#000000");
  });

  it("sempre retorna um hex válido", () => {
    expect(isValidHex(hsvToHex(210, 0.5, 0.8))).toBe(true);
  });
});

describe("hexToHsv", () => {
  it("faz o caminho inverso de hsvToHex", () => {
    const { h, s, v } = hexToHsv("#1e88e5");
    expect(hsvToHex(h, s, v)).toBe("#1e88e5");
  });

  it("retorna um fallback para hex inválido", () => {
    expect(hexToHsv("xyz")).toEqual({ h: 0, s: 1, v: 1 });
  });
});

describe("TAG_COLORS", () => {
  it("tem 14 cores válidas e distintas", () => {
    expect(TAG_COLORS).toHaveLength(14);
    TAG_COLORS.forEach((color) => expect(isValidHex(color)).toBe(true));
    expect(new Set(TAG_COLORS).size).toBe(14);
  });
});
