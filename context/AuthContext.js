import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { getSession, onAuthStateChange } from "../services/authService";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual ao iniciar
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças de estado (login, logout, etc)
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => {
    const user = session?.user;
    const displayName =
      user?.user_metadata?.full_name?.trim() ||
      user?.email?.split("@")[0] ||
      "";

    return {
      session,
      user,
      displayName,
      loading,
    };
  }, [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
