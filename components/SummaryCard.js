import React from "react";
import { View, Text } from "react-native";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
import MoneyText from "./MoneyText";
export default function SummaryCard({ summary, compact = false }) {
  if (!summary) return null;
  return (
    <View style={{ gap: 12 }}>
      <View style={[ui.card, { backgroundColor: colors.primarySoft }]}>
        <Text style={ui.label}>Resultado previsto do período</Text>
        <MoneyText
          value={summary.balance}
          style={{
            fontSize: compact ? 28 : 36,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -1,
          }}
        />
        <Text style={ui.muted}>Inclui lançamentos pendentes</Text>
        <View style={{ height: 1, backgroundColor: "#D7D3FA" }} />
        <View style={[ui.between, { flexWrap: "wrap" }]}>
          <Text style={ui.label}>Resultado realizado</Text>
          <MoneyText
            value={summary.realized}
            style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <View
          style={[ui.card, { flex: 1, minWidth: 130, padding: 16, gap: 8 }]}
        >
          <Text style={ui.label}>↗ Receitas previstas</Text>
          <MoneyText
            value={summary.income}
            style={{ fontSize: 20, fontWeight: "600", color: colors.income }}
          />
        </View>
        <View
          style={[ui.card, { flex: 1, minWidth: 130, padding: 16, gap: 8 }]}
        >
          <Text style={ui.label}>↘ Despesas previstas</Text>
          <MoneyText
            value={summary.expense}
            style={{ fontSize: 20, fontWeight: "600", color: colors.expense }}
          />
        </View>
      </View>
    </View>
  );
}
