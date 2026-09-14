import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

// Seletor de tag: mostra a tag escolhida e botão para escolher/criar.
export default function TagSelector({
  tags = [],
  selectedTagId,
  onPress,
  onClear,
  onAdd,
  accentColor = colors.accent,
  style,
}) {
  const selected = tags.find((tag) => tag.id === selectedTagId);

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity style={styles.selector} onPress={onPress}>
        {selected ? (
          <View style={styles.content}>
            <View
              style={[
                styles.dot,
                { backgroundColor: selected.color || colors.accent },
              ]}
            />
            <Text style={styles.text}>{selected.name || "Tag"}</Text>
            <TouchableOpacity onPress={onClear} style={styles.clear}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.placeholder}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={colors.placeholder}
            />
            <Text style={styles.placeholder}>Adicionar tag</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add-circle-outline" size={22} color={accentColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
    gap: 8,
  },
  selector: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  clear: {
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    fontSize: 14,
    color: colors.placeholder,
    marginLeft: 6,
  },
  addButton: {
    padding: 4,
  },
});
