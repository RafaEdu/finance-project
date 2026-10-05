import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getStatusLabel } from "../utils/finance";
import { formatTransactionDate } from "../utils/date";
import MoneyText from "./MoneyText";
export default function TransactionCard({ transaction, tag, onPress }) {
  const income = transaction.type === "income";
  const series =
    transaction.installmentTotal > 1
      ? ` · ${transaction.entryKind === "installment" ? "Parcela" : "Ocorrência"} ${transaction.installmentCurrent}/${transaction.installmentTotal}`
      : "";
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={() => onPress?.(transaction)}
      accessibilityRole={onPress ? "button" : undefined}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 8,
        minHeight: 80,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: income ? colors.incomeSoft : colors.surfaceMuted,
        }}
      >
        <Ionicons
          name={income ? "arrow-down-outline" : "arrow-up-outline"}
          size={19}
          color={income ? colors.income : colors.textSecondary}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "600",
            flexShrink: 1,
          }}
        >
          {transaction.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {tag?.name || "Sem tag"} · {formatTransactionDate(transaction.date)}
          {series}
        </Text>
        <Text
          style={{
            color: transaction.settled ? colors.textSecondary : colors.warning,
            fontSize: 12,
          }}
        >
          {getStatusLabel(transaction)}
        </Text>
        <MoneyText
          value={transaction.amount}
          prefix={income ? "+ " : "− "}
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: income ? colors.income : colors.text,
          }}
        />
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      )}
    </TouchableOpacity>
  );
}
