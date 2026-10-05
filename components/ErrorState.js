import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppButton from "./AppButton";
import { colors } from "../constants/colors";

export default function ErrorState({ onRetry }) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert" style={styles.message}>
        Não foi possível carregar as movimentações. Verifique sua conexão e
        tente novamente.
      </Text>
      <AppButton title="Tentar novamente" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 16 },
  message: { color: colors.text, fontSize: 16, textAlign: "center" },
});
