import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// Gera um UUID v4 válido (usado para agrupar parcelas/recorrências).
export function generateUUID() {
  return uuidv4();
}
