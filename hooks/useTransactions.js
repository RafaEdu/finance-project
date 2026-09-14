import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getTransactions } from "../services/transactionsService";
import { refreshSession } from "../services/authService";

function isJwtError(error) {
  if (!error) return false;
  const text = `${error.message || ""} ${JSON.stringify(error)}`.toLowerCase();
  return text.includes("jwt");
}

// Busca receitas/despesas do período e renova o token automaticamente quando expira.
export function useTransactions({
  startISO,
  endISO,
  tagId,
  enabled = true,
} = {}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(
    async ({ isRefresh = false, retryCount = 0 } = {}) => {
      if (!user?.id || !enabled) {
        setTransactions([]);
        setLoading(false);
        setRefreshing(false);
        return { data: [], error: null };
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await getTransactions(user.id, {
        startISO,
        endISO,
        tagId,
      });

      if (result.error && isJwtError(result.error) && retryCount < 3) {
        const { error: refreshError } = await refreshSession();
        if (!refreshError) {
          return fetchTransactions({ isRefresh, retryCount: retryCount + 1 });
        }
      }

      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setTransactions(result.data);
      }

      setLoading(false);
      setRefreshing(false);
      return result;
    },
    [user?.id, enabled, startISO, endISO, tagId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
  );

  const refresh = useCallback(
    () => fetchTransactions({ isRefresh: true }),
    [fetchTransactions],
  );

  return {
    transactions,
    loading,
    refreshing,
    error,
    setTransactions,
    fetchTransactions,
    refresh,
  };
}
