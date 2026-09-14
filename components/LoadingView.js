import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

// Indicador de carregamento padrão. Use `fullScreen` para telas inteiras.
export default function LoadingView({ fullScreen = false, style }) {
  return (
    <View style={[fullScreen ? styles.fullScreen : styles.inline, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inline: {
    alignItems: "center",
    marginVertical: 30,
  },
});
