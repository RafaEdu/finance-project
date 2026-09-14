import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

// Toast de sucesso exibido sobre o conteúdo da tela.
export default function Toast({ visible, message, bottom = 80 }) {
  if (!visible) return null;

  return (
    <View style={[styles.container, { bottom }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: colors.text,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 999,
  },
  text: {
    color: colors.white,
    fontWeight: "bold",
  },
});
