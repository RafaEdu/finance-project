import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2980b9",
    textAlign: "center",
  },
  // --- FORMULÁRIO DE CRIAÇÃO ---
  formContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    marginBottom: 10,
  },
  colorLabel: {
    fontSize: 14,
    color: "#666",
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
    borderColor: "#333",
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
    borderColor: "#ddd",
  },
  hexInput: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
    fontFamily: "monospace",
  },
  // --- PREVIEW (simula card do Dashboard) ---
  previewContainer: {
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  previewCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1,
    shadowColor: "#000",
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
    color: "#2c3e50",
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
    color: "#95a5a6",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // --- LISTA DE TAGS ---
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
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
  tagActions: {
    flexDirection: "row",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
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
    backgroundColor: "#e0e0e0",
  },
  modalButtonSave: {
    backgroundColor: "#2980b9",
  },
  modalButtonText: {
    fontWeight: "bold",
    color: "#333",
  },
  modalButtonTextSave: {
    fontWeight: "bold",
    color: "#fff",
  },
});
