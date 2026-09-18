import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.accent,
    textAlign: "center",
  },
  // --- FORMULÁRIO DE CRIAÇÃO ---
  formContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    marginBottom: 10,
  },
  colorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  // --- HEX INPUT ---
  hexInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  hexPreviewDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hexPreviewDotActive: {
    borderWidth: 3,
    borderColor: colors.accent,
  },
  hexInput: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    fontFamily: "monospace",
  },
  errorText: {
    color: colors.expense,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  // --- PREVIEW (simula card do Dashboard) ---
  previewContainer: {
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.placeholder,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  previewCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  previewIconWrapper: {
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 3,
    gap: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textStrong,
  },
  previewTagBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  previewTagText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  previewDate: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // --- LISTA DE TAGS ---
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textMedium,
    marginBottom: 10,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  tagBadgeInline: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    alignSelf: "flex-start",
  },
  tagBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  tagActions: {
    flexDirection: "row",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: colors.placeholder,
    fontSize: 14,
    marginTop: 30,
  },
  // --- MODAL DE EDIÇÃO ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: colors.segmentBackground,
  },
  modalButtonSave: {
    backgroundColor: colors.accent,
  },
  modalButtonText: {
    fontWeight: "bold",
    color: colors.text,
  },
  modalButtonTextSave: {
    fontWeight: "bold",
    color: colors.white,
  },
});
