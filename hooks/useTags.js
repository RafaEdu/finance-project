import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getTags } from "../services/tagsService";
import { createRequestGuard } from "../utils/finance";
export function useTags({ orderBy = "name", ascending = true } = {}) {
  const { user } = useAuth();
  const guard = useRef(createRequestGuard());
  const [state, setState] = useState({ tags: [], loading: true, error: null });
  const refresh = useCallback(async () => {
    const request = guard.current.next();
    if (!user?.id) {
      setState({ tags: [], loading: false, error: null });
      return;
    }
    setState((old) => ({ ...old, loading: true, error: null }));
    try {
      const result = await getTags(user.id, { orderBy, ascending });
      if (result.error) throw result.error;
      if (guard.current.isCurrent(request))
        setState({ tags: result.data, loading: false, error: null });
      return result;
    } catch (error) {
      if (guard.current.isCurrent(request))
        setState((old) => ({ ...old, loading: false, error }));
      return { data: [], error };
    }
  }, [user?.id, orderBy, ascending]);
  useFocusEffect(
    useCallback(() => {
      refresh();
      const activeGuard = guard.current;
      return () => activeGuard.invalidate();
    }, [refresh]),
  );
  return { ...state, refresh };
}
