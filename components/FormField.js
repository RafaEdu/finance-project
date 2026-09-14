import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

// Campo de formulário com label opcional, erro de validação e acessório à direita.
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
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, inputStyle, !!error && styles.inputError]}
          placeholderTextColor={colors.placeholder}
          {...inputProps}
        />
        {rightAccessory}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.expense,
  },
  error: {
    color: colors.expense,
    fontSize: 12,
    marginTop: 4,
  },
});
