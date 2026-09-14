import { Alert } from "react-native";

// Diálogo de confirmação para ações destrutivas (ex.: exclusão, logout).
export function confirmDestructive({
  title,
  message,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  onConfirm,
}) {
  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
