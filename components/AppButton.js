import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../constants/colors";

const VARIANTS = {
  primary: colors.primary,
  income: colors.income,
  expense: colors.expense,
  danger: colors.expense,
  neutral: colors.segmentBackground,
};

// Botão padrão da aplicação. Aceita `variant`, `color` ou `backgroundColor`.
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
  const isNeutral = variant === "neutral" && !color;
  const backgroundColor = disabled
    ? colors.borderStrong
    : color || VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.button, { backgroundColor }, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, isNeutral && styles.neutralText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  neutralText: {
    color: colors.text,
  },
});
