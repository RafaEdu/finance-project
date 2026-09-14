import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

const OPTIONS = [
  { value: "day", label: "Dia" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];

// Seletor segmentado de período (dia/mês/ano).
export default function PeriodFilter({ value, onChange, style }) {
  return (
    <View style={[styles.container, style]}>
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.button, isActive && styles.activeButton]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: colors.segmentBackground,
    borderRadius: 10,
    padding: 2,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  activeText: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
