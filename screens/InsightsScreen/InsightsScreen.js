import React, { useState } from "react";
import { View, Text, RefreshControl } from "react-native";
import { useFinanceQuery } from "../../hooks/useFinanceQuery";
import { getDateRange, changeDate, addMonthsClamped } from "../../utils/date";
import { percentageChange } from "../../utils/finance";
import { usePreferences } from "../../context/PreferencesContext";
import { ui } from "../../constants/theme";
import { colors } from "../../constants/colors";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import SummaryCard from "../../components/SummaryCard";
import MoneyText from "../../components/MoneyText";
import PeriodPicker from "../../components/PeriodPicker";
import LoadingView from "../../components/LoadingView";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
export default function InsightsScreen() {
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState("month");
  const { visible } = usePreferences();
  const current = useFinanceQuery(getDateRange(date, type), { pageSize: 0 });
  const previous = useFinanceQuery(
    getDateRange(changeDate(date, type, -1), type),
    { pageSize: 0 },
  );
  const historyStart = getDateRange(
    addMonthsClamped(date, -5),
    "month",
  ).startISO;
  const historyEnd = getDateRange(date, "month").endISO;
  const history = useFinanceQuery(
    { startISO: historyStart, endISO: historyEnd },
    { pageSize: 0 },
  );
  const refresh = () => {
    current.refresh();
    previous.refresh();
    history.refresh();
  };
  const change =
    current.data && previous.data
      ? percentageChange(
          current.data.summary.expense,
          previous.data.summary.expense,
        )
      : null;
  const max = Math.max(
    1,
    ...(history.data?.months || []).flatMap((month) => [
      month.income,
      month.expense,
    ]),
  );
  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={current.refreshing} onRefresh={refresh} />
      }
    >
      <ScreenHeader
        title="Relatórios"
        subtitle="Entenda para onde seu dinheiro vai."
        privacy
      />
      <PeriodPicker
        date={date}
        type={type}
        onDateChange={setDate}
        onTypeChange={setType}
      />
      {current.error ? (
        <ErrorState onRetry={refresh} />
      ) : !current.data ? (
        <LoadingView />
      ) : (
        <>
          <SummaryCard summary={current.data.summary} compact />
          <View style={ui.card}>
            <Text style={ui.heading}>Comparação de despesas</Text>
            <Text style={ui.muted}>
              Período selecionado versus período anterior completo.
            </Text>
            {previous.error ? (
              <ErrorState onRetry={previous.refresh} />
            ) : !previous.data ? (
              <LoadingView />
            ) : (
              <>
                <View style={[ui.between, { flexWrap: "wrap" }]}>
                  <Text style={ui.label}>Período anterior</Text>
                  <MoneyText
                    value={previous.data.summary.expense}
                    style={ui.heading}
                  />
                </View>
                <Text style={ui.muted}>
                  {!visible
                    ? "Comparação oculta"
                    : change === null
                      ? "Sem base anterior para calcular a variação."
                      : `${Math.abs(change).toFixed(1).replace(".", ",")}% ${change >= 0 ? "a mais" : "a menos"} em despesas previstas.`}
                </Text>
              </>
            )}
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>Despesas por tag</Text>
            <Text style={ui.muted}>
              Valores previstos, incluindo pendências.
            </Text>
            {!current.data.categories.length ? (
              <EmptyState text="Nenhuma despesa neste período." />
            ) : (
              current.data.categories.map((category) => (
                <View key={category.tag_id || "none"} style={{ gap: 8 }}>
                  <View style={[ui.between, { flexWrap: "wrap" }]}>
                    <Text style={[ui.label, { flexShrink: 1 }]}>
                      {category.tag_name}
                    </Text>
                    <MoneyText value={category.amount} style={ui.heading} />
                  </View>
                  {visible && (
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={{
                        height: 8,
                        backgroundColor: colors.segmentBackground,
                        borderRadius: 4,
                      }}
                    >
                      <View
                        style={{
                          height: 8,
                          borderRadius: 4,
                          width: `${current.data.summary.expense ? (category.amount / current.data.summary.expense) * 100 : 0}%`,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </>
      )}
      <View style={ui.card}>
        <Text style={ui.heading}>Últimos seis meses</Text>
        <Text style={ui.muted}>
          Receitas e despesas previstas por mês, até o mês selecionado.
        </Text>
        {history.error ? (
          <ErrorState onRetry={history.refresh} />
        ) : !history.data ? (
          <LoadingView />
        ) : !history.data.months.length ? (
          <EmptyState text="Ainda não há histórico para comparar." />
        ) : (
          history.data.months.map((month) => (
            <View key={month.month} style={{ gap: 8 }}>
              <Text style={ui.label}>
                {month.month.split("-").reverse().join("/")}
              </Text>
              <View style={ui.between}>
                <Text style={ui.muted}>Receitas</Text>
                <MoneyText
                  value={month.income}
                  style={{ color: colors.income, fontWeight: "600" }}
                />
              </View>
              {visible && (
                <View
                  style={{
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: colors.income,
                    width: `${(month.income / max) * 100}%`,
                  }}
                />
              )}
              <View style={ui.between}>
                <Text style={ui.muted}>Despesas</Text>
                <MoneyText
                  value={month.expense}
                  style={{ color: colors.expense, fontWeight: "600" }}
                />
              </View>
              {visible && (
                <View
                  style={{
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: colors.expense,
                    width: `${(month.expense / max) * 100}%`,
                  }}
                />
              )}
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
