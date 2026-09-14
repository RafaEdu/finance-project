// Calcula a luminância relativa de uma cor hex e retorna branco ou preto.
export function getContrastTextColor(hexColor) {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Fórmula de luminância relativa (WCAG)
  const toLinear = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.4 ? "#000000" : "#ffffff";
}

// Valida um código de cor no formato #RRGGBB.
export function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
