import assert from "node:assert/strict";
import { test } from "node:test";
import { addMonthsClamped, changeDate, getDateRange } from "../utils/date.js";
import { buildInstallments, hasValidInstallments } from "../utils/installments.js";

test("filtro de janeiro no dia 31 não inclui fevereiro", () => {
  const { startISO, endISO } = getDateRange(new Date(2026, 0, 31, 12), "month");
  assert.equal(new Date(startISO).getDate(), 1);
  assert.equal(new Date(endISO).getMonth(), 0);
  assert.equal(new Date(endISO).getDate(), 31);
  assert.equal(new Date(endISO).getHours(), 23);
});

test("navegação mensal limita o dia e não pula fevereiro", () => {
  const original = new Date(2026, 0, 31, 12);
  const result = changeDate(original, "month", 1);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 28);
  assert.equal(result.getHours(), 12);
  assert.equal(original.getDate(), 31);
  assert.equal(changeDate(new Date(2026, 2, 31), "month", -1).getMonth(), 1);
});

test("ano bissexto e passagem de ano preservam o mês esperado", () => {
  assert.equal(addMonthsClamped(new Date(2024, 0, 31), 1).getDate(), 29);
  const nextYear = changeDate(new Date(2024, 1, 29), "year", 1);
  assert.equal(nextYear.getMonth(), 1);
  assert.equal(nextYear.getDate(), 28);
  const january = addMonthsClamped(new Date(2026, 11, 31), 1);
  assert.equal(january.getFullYear(), 2027);
  assert.equal(january.getMonth(), 0);
});

test("parcelas de 31 de janeiro caem em 31/01, 28/02 e 31/03", () => {
  const items = buildInstallments({ date: new Date(2026, 0, 31), count: 3, baseValue: 100 });
  assert.deepEqual(items.map((item) => [item.date.getMonth(), item.date.getDate()]), [[0, 31], [1, 28], [2, 31]]);
});

test("desativar valores diferentes restaura o valor base em todas as parcelas", () => {
  const options = { date: new Date(2026, 0, 31), count: 2, baseValue: 100, previous: [{ value: 40 }, { value: 60 }] };
  assert.deepEqual(buildInstallments({ ...options, different: true }).map((item) => item.value), [40, 60]);
  assert.deepEqual(buildInstallments({ ...options, different: false }).map((item) => item.value), [100, 100]);
});

test("parcelas vazias, não finitas, negativas ou incompletas são rejeitadas", () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal(hasValidInstallments([{ value: 10 }, { value }], 2), false);
  }
  assert.equal(hasValidInstallments([{ value: 10 }], 2), false);
  assert.equal(hasValidInstallments([{ value: 10 }, { value: 20 }], 2), true);
});
