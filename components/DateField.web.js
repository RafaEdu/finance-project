import React from "react";
import { View, Text } from "react-native";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
export default function DateField({ value, onChange, label = "Data" }) {
  const formatted = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.label}>{label}</Text>
      {React.createElement("input", {
        type: "date",
        "aria-label": label,
        value: formatted,
        onChange: (event) => {
          const parts = event.target.value.split("-").map(Number);
          if (parts.length === 3 && parts.every(Boolean))
            onChange(new Date(parts[0], parts[1] - 1, parts[2], 12));
        },
        style: {
          minHeight: 52,
          padding: 12,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 12,
          font: "16px system-ui",
          color: colors.text,
          background: colors.surface,
          width: "100%",
          boxSizing: "border-box",
        },
      })}
    </View>
  );
}
