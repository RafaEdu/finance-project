import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDateBR } from "../utils/date";
import { ui } from "../constants/theme";
import AppButton from "./AppButton";
export default function DateField({ value, onChange, label = "Data" }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.label}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDateBR(value)}`}
        onPress={() => setOpen(true)}
        style={[ui.card, { minHeight: 52, padding: 14 }]}
      >
        <Text style={ui.muted}>{formatDateBR(value)}</Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selected) => {
            if (Platform.OS !== "ios") setOpen(false);
            if (event.type !== "dismissed" && selected) onChange(selected);
          }}
        />
      )}
      {open && Platform.OS === "ios" && (
        <AppButton
          title="Concluir data"
          variant="neutral"
          onPress={() => setOpen(false)}
        />
      )}
    </View>
  );
}
