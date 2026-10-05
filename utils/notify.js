import { Alert } from "react-native";
export function notify(title, message) {
  Alert.alert(title, message);
}
