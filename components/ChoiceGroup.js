import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
export default function ChoiceGroup({ options, value, onChange, label }) {
  return (
    <View style={{ gap: 8 }} accessibilityLabel={label}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: option.value === value }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={{
              minHeight: 48,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 14,
              backgroundColor:
                option.value === value
                  ? colors.primarySoft
                  : colors.surfaceMuted,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  option.value === value
                    ? colors.primary
                    : colors.textSecondary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
