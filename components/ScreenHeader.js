import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ui } from "../constants/theme";
import { colors } from "../constants/colors";
import { usePreferences } from "../context/PreferencesContext";
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  privacy = false,
  right,
}) {
  const { visible, toggleVisibility } = usePreferences();
  return (
    <View style={ui.between}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={ui.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Text accessibilityRole="header" style={ui.title}>
          {title}
        </Text>
        {subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}
      </View>
      {privacy && (
        <TouchableOpacity
          style={ui.iconButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar valores" : "Mostrar valores"}
          onPress={toggleVisibility}
        >
          <Ionicons
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={23}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
      {right}
    </View>
  );
}
