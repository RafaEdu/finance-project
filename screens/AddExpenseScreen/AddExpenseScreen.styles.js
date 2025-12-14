import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#e74c3c",
  },
  label: { fontSize: 16, marginBottom: 5, fontWeight: "500", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 30,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 10,
  },
  // Estilos do Pop-up (Toast)
  toastContainer: {
    position: "absolute",
    bottom: 40, // Distância do fundo
    left: 20,
    right: 20,
    backgroundColor: "rgba(50, 50, 50, 0.9)", // Fundo escuro semi-transparente
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000, // Garante que fique acima de tudo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
