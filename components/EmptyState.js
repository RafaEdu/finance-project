import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

// Estado vazio com ícone opcional e mensagem.
export default function EmptyState({
  icon,
  iconSize = 60,
  iconColor = colors.textLight,
  text,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {!!icon && <Ionicons name={icon} size={iconSize} color={iconColor} />}
      {!!text && (
        <Text style={[styles.text, !!icon && styles.textWithIcon]}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 30,
  },
  text: {
    color: colors.textSubtle,
    fontSize: 16,
    textAlign: "center",
  },
  textWithIcon: {
    marginTop: 10,
  },
});
