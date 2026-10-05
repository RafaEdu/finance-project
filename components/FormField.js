import React from "react";
import { View, Text, TextInput } from "react-native";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
export default function FormField({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  rightAccessory,
  ...inputProps
}) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {!!label && <Text style={[ui.label, labelStyle]}>{label}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TextInput
          accessibilityLabel={label || inputProps.placeholder}
          placeholderTextColor={colors.placeholder}
          style={[
            {
              flex: 1,
              minHeight: 52,
              borderWidth: 1,
              borderColor: error ? colors.expense : colors.borderLight,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
            },
            inputStyle,
          ]}
          {...inputProps}
        />
        {rightAccessory}
      </View>
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ color: colors.expense, fontSize: 13 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
