import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { changeDate, formatDisplayDate } from "../utils/date";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
import Sheet from "./Sheet";
import ChoiceGroup from "./ChoiceGroup";
import DateField from "./DateField";
export default function PeriodPicker({
  date,
  type,
  onDateChange,
  onTypeChange,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <View
        style={[
          ui.between,
          { backgroundColor: colors.surface, borderRadius: 16 },
        ]}
      >
        <TouchableOpacity
          style={ui.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Período anterior"
          onPress={() => onDateChange(changeDate(date, type, -1))}
        >
          <Ionicons name="chevron-back" size={21} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Escolher período"
          onPress={() => setOpen(true)}
          style={{ flex: 1, minHeight: 48, justifyContent: "center" }}
        >
          <Text
            style={[
              ui.label,
              { textAlign: "center", textTransform: "capitalize" },
            ]}
          >
            {formatDisplayDate(date, type)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={ui.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Próximo período"
          onPress={() => onDateChange(changeDate(date, type, 1))}
        >
          <Ionicons name="chevron-forward" size={21} color={colors.text} />
        </TouchableOpacity>
      </View>
      <Sheet
        visible={open}
        title="Escolher período"
        onClose={() => setOpen(false)}
      >
        <ChoiceGroup
          value={type}
          onChange={onTypeChange}
          options={[
            { value: "day", label: "Dia" },
            { value: "month", label: "Mês" },
            { value: "year", label: "Ano" },
          ]}
        />
        <DateField
          value={date}
          onChange={onDateChange}
          label="Data de referência"
        />
      </Sheet>
    </>
  );
}
