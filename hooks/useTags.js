import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getTags } from "../services/tagsService";

// Carrega as tags do usuário e expõe um `refresh` para recarregar após mutações.
export function useTags({ orderBy = "name", ascending = true } = {}) {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setTags([]);
      setLoading(false);
      return { data: [], error: null };
    }

    setLoading(true);
    const result = await getTags(user.id, { orderBy, ascending });

    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setTags(result.data);
    }

    setLoading(false);
    return result;
  }, [user?.id, orderBy, ascending]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { tags, loading, error, refresh };
}
