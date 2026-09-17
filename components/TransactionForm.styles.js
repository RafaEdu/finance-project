import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  // --- ABAS (TABS) ---
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: colors.segmentBackground,
    borderRadius: 10,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  tabTextActive: {
    fontWeight: "bold",
  },
  // --- COMUNS ---
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  // --- SELETOR (ROLETA) ---
  selectorButton: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: colors.text,
  },
  // --- SWITCH ---
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  // --- LISTA DE PARCELAS ---
  listContainer: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
  },
  installmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  installmentLabel: {
    fontSize: 14,
    color: colors.textMedium,
  },
  installmentValueFixed: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  installmentInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 100,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  // --- FOOTER ---
  footerContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: colors.textMuted,
  },
  // --- MODAL DA ROLETA ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    height: "60%",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: colors.text,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 18,
    color: colors.text,
  },
  listPadding: {
    paddingBottom: 24,
  },
});
