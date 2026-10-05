import {
  splitAmount,
  percentageChange,
  createRequestGuard,
  getStatusLabel,
} from "../finance";
import { buildInstallments, hasValidInstallments } from "../installments";
describe("regras financeiras", () => {
  it("distribui centavos sem perder o total", () => {
    expect(splitAmount(100, 3)).toEqual([33.34, 33.33, 33.33]);
    expect(splitAmount(0.05, 3)).toEqual([0.02, 0.02, 0.01]);
  });
  it("rejeita total insuficiente e quantidades inválidas", () => {
    expect(() => splitAmount(0.01, 3)).toThrow();
    expect(() => splitAmount(10, 0)).toThrow();
    expect(() => splitAmount(Infinity, 2)).toThrow();
  });
  it("não inventa percentual com base zero", () => {
    expect(percentageChange(100, 0)).toBeNull();
    expect(percentageChange(80, 100)).toBe(-20);
  });
  it("invalida respostas antigas e respostas após desmontagem", () => {
    const guard = createRequestGuard();
    const a = guard.next();
    const b = guard.next();
    expect(guard.isCurrent(a)).toBe(false);
    expect(guard.isCurrent(b)).toBe(true);
    guard.invalidate();
    expect(guard.isCurrent(b)).toBe(false);
  });
  it("nomeia situações conforme o tipo", () => {
    expect(getStatusLabel({ type: "income", settled: true })).toBe("Recebido");
    expect(getStatusLabel({ type: "expense", settled: false })).toBe("A pagar");
  });
  it("mantém o dia original após fevereiro", () => {
    const items = buildInstallments({
      date: new Date(2026, 0, 31),
      count: 3,
      baseValue: 50,
    });
    expect(items.map((x) => x.date.getDate())).toEqual([31, 28, 31]);
    expect(hasValidInstallments(items, 3)).toBe(true);
    expect(hasValidInstallments([{ value: 0 }], 1)).toBe(false);
  });
});
