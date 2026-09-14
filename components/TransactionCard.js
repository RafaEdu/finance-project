import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { formatCurrency } from "../utils/currency";
import { formatTransactionDate } from "../utils/date";

// Card de movimentação (receita/despesa) reutilizado no Dashboard e Insights.
export default function TransactionCard({
  transaction,
  tag,
  onEdit,
  onDelete,
  showActions = false,
}) {
  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const hasMultipleOccurrences =
    transaction.installmentTotal && transaction.installmentTotal > 1;
  const isRecurrence = isIncome && hasMultipleOccurrences;
  const isInstallment = !isIncome && hasMultipleOccurrences;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name={isIncome ? "arrow-up-circle" : "arrow-down-circle"}
          size={24}
          color={isIncome ? colors.income : colors.expense}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{transaction.name || "Sem nome"}</Text>

          {isRecurrence && (
            <View style={styles.recurrenceBadge}>
              <Text style={styles.recurrenceText}>
                Receita {transaction.installmentCurrent}/
                {transaction.installmentTotal}
              </Text>
            </View>
          )}

          {isInstallment && (
            <View style={styles.installmentBadge}>
              <Text style={styles.installmentText}>
                Parcela {transaction.installmentCurrent}/
                {transaction.installmentTotal}
              </Text>
            </View>
          )}

          {tag && (
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: tag.color || colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.tagBadgeText,
                  { color: tag.textColor || colors.white },
                ]}
              >
                {tag.name}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.date}>
          {formatTransactionDate(transaction.date)}
        </Text>

        {!!transaction.description && (
          <Text style={styles.description}>{transaction.description}</Text>
        )}
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.value,
            { color: isIncome ? colors.income : colors.expense },
          ]}
        >
          {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
        </Text>

        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit && onEdit(transaction)}
              style={styles.actionButton}
              activeOpacity={0.6}
              hitSlop={HIT_SLOP}
            >
              <Ionicons name="pencil" size={20} color={colors.warning} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete && onDelete(transaction)}
              style={styles.actionButton}
              activeOpacity={0.6}
              hitSlop={HIT_SLOP}
            >
              <Ionicons name="trash" size={20} color={colors.expense} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconWrapper: {
    marginRight: 15,
    justifyContent: "center",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textStrong,
    marginRight: 8,
  },
  installmentBadge: {
    backgroundColor: colors.expense,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  installmentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  recurrenceBadge: {
    backgroundColor: colors.income,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  recurrenceText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  tagBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
});
