import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { queryFinance } from "../services/transactionsService";
import { refreshSession } from "../services/authService";
import { createRequestGuard } from "../utils/finance";
const EMPTY = {
  data: null,
  loading: true,
  error: null,
  loadingMore: false,
  refreshing: false,
};
export function useFinanceQuery(filters = {}, { pageSize = 30 } = {}) {
  const { user } = useAuth();
  const key = JSON.stringify({ ...filters, userId: user?.id, pageSize });
  const params = useMemo(() => JSON.parse(key), [key]);
  const guard = useRef(createRequestGuard());
  const moreBusy = useRef(false);
  const [state, setState] = useState({ key: null, ...EMPTY });
  const current = state.key === key ? state : EMPTY;
  const fetchPage = useCallback(
    async ({ refresh = false, offset = 0, append = false } = {}) => {
      if (!params.userId || (append && moreBusy.current)) return;
      const request = guard.current.next();
      moreBusy.current = append;
      setState((old) => ({
        key,
        data: old.key === key ? old.data : null,
        error: null,
        loading: !append && !refresh,
        refreshing: refresh,
        loadingMore: append,
      }));
      try {
        let result = await queryFinance(params, {
          offset,
          limit: params.pageSize,
        });
        if (
          result.error?.code === "PGRST301" ||
          result.error?.message?.toLowerCase().includes("jwt")
        ) {
          const { error } = await refreshSession();
          if (!error && guard.current.isCurrent(request))
            result = await queryFinance(params, {
              offset,
              limit: params.pageSize,
            });
        }
        if (result.error) throw result.error;
        if (!guard.current.isCurrent(request)) return;
        setState((old) => {
          const items = append
            ? [...(old.data?.items || []), ...result.data.items]
            : result.data.items;
          const unique = [
            ...new Map(
              items.map((item) => [`${item.type}:${item.id}`, item]),
            ).values(),
          ];
          return {
            key,
            data: {
              ...result.data,
              items: unique,
              nextOffset: offset + result.data.items.length,
            },
            loading: false,
            refreshing: false,
            loadingMore: false,
            error: null,
          };
        });
      } catch (error) {
        if (guard.current.isCurrent(request))
          setState((old) => ({
            ...old,
            error,
            loading: false,
            refreshing: false,
            loadingMore: false,
          }));
      } finally {
        if (guard.current.isCurrent(request)) moreBusy.current = false;
      }
    },
    [key, params],
  );
  useFocusEffect(
    useCallback(() => {
      fetchPage();
      const activeGuard = guard.current;
      return () => {
        activeGuard.invalidate();
        moreBusy.current = false;
      };
    }, [fetchPage]),
  );
  const refresh = useCallback(() => fetchPage({ refresh: true }), [fetchPage]);
  const offset = current.data?.nextOffset;
  const hasMore = !!current.data && offset < current.data.total;
  const { loading, refreshing, error } = current;
  const loadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing && !error)
      return fetchPage({ append: true, offset });
  }, [hasMore, loading, refreshing, error, offset, fetchPage]);
  return { ...current, refresh, loadMore, hasMore };
}
