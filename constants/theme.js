import { StyleSheet } from "react-native";
import { colors } from "./colors";
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  heading: { fontSize: 18, fontWeight: "600", color: colors.text },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  section: { gap: 12 },
  muted: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  link: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  iconButton: {
    width: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
});
