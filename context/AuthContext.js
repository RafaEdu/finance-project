import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getSession,
  onAuthStateChange,
  verifyOtp,
  updateUser,
} from "../services/authService";
const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);
const RECOVERY_KEY = "@finance/recovery-user";
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const [authError, setAuthError] = useState(null);
  const recovering = useRef(false);
  const markRecovery = useCallback((newSession) => {
    setRecovery(true);
    if (newSession?.user?.id)
      AsyncStorage.setItem(RECOVERY_KEY, newSession.user.id).catch(() => {});
  }, []);
  useEffect(() => {
    let active = true;
    let eventReceived = false;
    Promise.all([getSession(), AsyncStorage.getItem(RECOVERY_KEY)])
      .then(([result, marker]) => {
        if (!active || eventReceived) return;
        if (result.error) setAuthError(result.error);
        setSession(result.data?.session || null);
        setRecovery(!!marker && marker === result.data?.session?.user?.id);
        setLoading(false);
      })
      .catch((error) => {
        if (active) {
          setAuthError(error);
          setLoading(false);
        }
      });
    const {
      data: { subscription },
    } = onAuthStateChange((event, newSession) => {
      if (!active || event === "INITIAL_SESSION") return;
      eventReceived = true;
      setSession(newSession);
      setLoading(false);
      setAuthError(null);
      if (event === "PASSWORD_RECOVERY" || (recovering.current && newSession))
        markRecovery(newSession);
      if (!newSession) {
        setRecovery(false);
        recovering.current = false;
        AsyncStorage.removeItem(RECOVERY_KEY).catch(() => {});
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [markRecovery]);
  const verifyRecovery = useCallback(
    async (email, token) => {
      recovering.current = true;
      try {
        const result = await verifyOtp({ email, token, type: "recovery" });
        if (!result.error && result.data?.session) {
          setSession(result.data.session);
          markRecovery(result.data.session);
        }
        return result;
      } finally {
        recovering.current = false;
      }
    },
    [markRecovery],
  );
  const finishRecovery = useCallback(async (password) => {
    const result = await updateUser({ password });
    if (!result.error) {
      await AsyncStorage.removeItem(RECOVERY_KEY);
      setRecovery(false);
    }
    return result;
  }, []);
  const value = useMemo(
    () => ({
      session,
      user: session?.user,
      displayName:
        session?.user?.user_metadata?.full_name?.trim() ||
        session?.user?.email?.split("@")[0] ||
        "",
      loading,
      recovery,
      authError,
      verifyRecovery,
      finishRecovery,
    }),
    [session, loading, recovery, authError, verifyRecovery, finishRecovery],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
