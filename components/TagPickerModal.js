import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
import Sheet from "./Sheet";

export default function TagPickerModal({
  visible,
  tags = [],
  onSelect,
  onClose,
}) {
  return (
    <Sheet visible={visible} title="Selecionar tag" onClose={onClose}>
      {tags.length ? (
        tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            accessibilityRole="button"
            onPress={() => {
              onSelect(tag.id);
              onClose();
            }}
            style={[ui.row, { minHeight: 48, paddingVertical: 12 }]}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: tag.color || colors.primary,
              }}
            />
            <Text style={[ui.heading, { flex: 1 }]}>{tag.name}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={ui.muted}>
          Nenhuma tag cadastrada. Volte e use Gerenciar tags para criar a
          primeira.
        </Text>
      )}
    </Sheet>
  );
}
