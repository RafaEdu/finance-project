import React from "react";
import { act, create } from "react-test-renderer";
import { useFinanceQuery } from "../useFinanceQuery";
import { queryFinance } from "../../services/transactionsService";
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback) =>
    require("react").useEffect(callback, [callback]),
}));
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "owner" } }),
}));
jest.mock("../../services/transactionsService", () => ({
  queryFinance: jest.fn(),
}));
jest.mock("../../services/authService", () => ({ refreshSession: jest.fn() }));
let latest, renderer;
function Probe({ filters }) {
  const value = useFinanceQuery(filters);
  React.useEffect(() => {
    latest = value;
  }, [value]);
  return null;
}
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
const response = (id, total = 1) => ({
  data: { items: [{ id, type: "expense" }], total, summary: { expense: 10 } },
  error: null,
});
beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
it("a resposta do filtro antigo não sobrescreve a nova", async () => {
  const old = deferred(),
    recent = deferred();
  queryFinance
    .mockReturnValueOnce(old.promise)
    .mockReturnValueOnce(recent.promise);
  await act(async () => {
    renderer = create(<Probe filters={{ tagId: "A" }} />);
  });
  await act(async () => renderer.update(<Probe filters={{ tagId: "B" }} />));
  await act(async () => recent.resolve(response("B")));
  expect(latest.data.items[0].id).toBe("B");
  await act(async () => old.resolve(response("A")));
  expect(latest.data.items[0].id).toBe("B");
});
it("exceção de rede encerra loading e permite tentar novamente", async () => {
  queryFinance
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(response("ok"));
  await act(async () => {
    renderer = create(<Probe filters={{}} />);
  });
  expect(latest.loading).toBe(false);
  expect(latest.error.message).toBe("offline");
  await act(async () => latest.refresh());
  expect(latest.error).toBeNull();
  expect(latest.data.items[0].id).toBe("ok");
});
it("impede duas cargas simultâneas da próxima página", async () => {
  const next = deferred();
  queryFinance
    .mockResolvedValueOnce(response("first", 2))
    .mockReturnValueOnce(next.promise);
  await act(async () => {
    renderer = create(<Probe filters={{}} />);
  });
  await act(async () => {
    latest.loadMore();
    latest.loadMore();
  });
  expect(queryFinance).toHaveBeenCalledTimes(2);
  await act(async () => next.resolve(response("second", 2)));
  expect(latest.data.items).toHaveLength(2);
  expect(latest.hasMore).toBe(false);
});
