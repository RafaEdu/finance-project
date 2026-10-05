import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
const PreferencesContext = createContext({
  visible: false,
  toggleVisibility: () => {},
});
export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const key = `@finance/values-visible/${user?.id || "anonymous"}`;
  const [preference, setPreference] = useState({ key: null, visible: false });
  const visible = preference.key === key && preference.visible;
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (active)
          setPreference((current) =>
            current.key === key ? current : { key, visible: stored === "true" },
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [key]);
  const toggleVisibility = useCallback(() => {
    const next = !visible;
    setPreference({ key, visible: next });
    AsyncStorage.setItem(key, String(next)).catch(() => {});
  }, [key, visible]);
  return (
    <PreferencesContext.Provider value={{ visible, toggleVisibility }}>
      {children}
    </PreferencesContext.Provider>
  );
}
export const usePreferences = () => useContext(PreferencesContext);
