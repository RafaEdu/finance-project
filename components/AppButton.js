import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../constants/colors";
export default function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  color,
  variant = "primary",
  style,
  textStyle,
  ...rest
}) {
  const neutral = variant === "neutral";
  const backgroundColor =
    color ||
    (neutral
      ? colors.segmentBackground
      : variant === "danger"
        ? colors.expense
        : colors.primary);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          minHeight: 48,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={neutral ? colors.text : colors.white} />
      ) : (
        <Text
          style={[
            {
              color: neutral ? colors.text : colors.white,
              fontWeight: "600",
              fontSize: 16,
              textAlign: "center",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
