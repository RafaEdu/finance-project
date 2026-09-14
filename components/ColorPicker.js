import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAG_COLORS, colors } from "../constants/colors";
import { getContrastTextColor } from "../utils/color";

// Grade de cores para seleção de uma tag.
export default function ColorPicker({
  palette = TAG_COLORS,
  selectedColor,
  onSelect,
  style,
}) {
  return (
    <View style={[styles.row, style]}>
      {palette.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.option,
            { backgroundColor: color },
            selectedColor === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
        >
          {selectedColor === color && (
            <Ionicons
              name="checkmark"
              size={18}
              color={getContrastTextColor(color)}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  option: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
});
