import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { changeDate, formatDisplayDate } from "../utils/date";

// Navegação de data (anterior / atual / próxima) conforme o período selecionado.
export default function DateNavigator({
  date,
  type,
  onChange,
  onPressDate,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => onChange(changeDate(date, type, -1))}
        style={styles.button}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressDate}>
        <Text style={styles.text}>{formatDisplayDate(date, type)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange(changeDate(date, type, 1))}
        style={styles.button}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  button: {
    padding: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
});
