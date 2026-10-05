import React from "react";
import { Text } from "react-native";
import { usePreferences } from "../context/PreferencesContext";
import { formatCurrency } from "../utils/currency";
export default function MoneyText({ value, prefix = "", style, ...props }) {
  const { visible } = usePreferences();
  return (
    <Text
      {...props}
      style={[{ fontVariant: ["tabular-nums"], flexShrink: 1 }, style]}
      accessibilityLabel={
        visible ? `${prefix}${formatCurrency(value)}` : "Valor oculto"
      }
    >
      {visible ? `${prefix}${formatCurrency(value)}` : "••••"}
    </Text>
  );
}
