import React, { useState } from "react";
import { View, Text, TouchableOpacity, RefreshControl } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTags } from "../../hooks/useTags";
import { useFinanceQuery } from "../../hooks/useFinanceQuery";
import { getDateRange } from "../../utils/date";
import { ui } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import SummaryCard from "../../components/SummaryCard";
import PeriodPicker from "../../components/PeriodPicker";
import NewTransactionButton from "../../components/NewTransactionButton";
import TransactionCard from "../../components/TransactionCard";
import TransactionDetails from "../../components/TransactionDetails";
import LoadingView from "../../components/LoadingView";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
export default function DashboardScreen({ navigation }) {
  const { displayName } = useAuth();
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState("month");
  const [selected, setSelected] = useState(null);
  const { tags } = useTags();
  const query = useFinanceQuery(getDateRange(date, type), { pageSize: 5 });
  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={query.refreshing}
          onRefresh={query.refresh}
        />
      }
    >
      <ScreenHeader
        title={`Olá, ${displayName || "você"}`}
        subtitle="Sua vida financeira, com clareza."
        privacy
      />
      <PeriodPicker
        date={date}
        type={type}
        onDateChange={setDate}
        onTypeChange={setType}
      />
      {query.error ? (
        <ErrorState onRetry={query.refresh} />
      ) : !query.data ? (
        <LoadingView />
      ) : (
        <>
          <SummaryCard summary={query.data.summary} />
          <NewTransactionButton navigation={navigation} />
          <View style={ui.between}>
            <Text style={[ui.heading, { flex: 1 }]}>Últimas movimentações</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate(ROUTES.transactions, {
                  initialDate: date.toISOString(),
                  selectionKey: Date.now(),
                  initialPeriod: type,
                })
              }
              style={{ minHeight: 48, justifyContent: "center" }}
            >
              <Text style={ui.link}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View>
            {query.data.items.length ? (
              query.data.items.map((item) => (
                <TransactionCard
                  key={`${item.type}:${item.id}`}
                  transaction={item}
                  tag={tags.find((t) => t.id === item.tagId)}
                  onPress={setSelected}
                />
              ))
            ) : (
              <EmptyState text="Seu período começa aqui. Adicione sua primeira receita ou despesa." />
            )}
          </View>
        </>
      )}
      <TransactionDetails
        transaction={selected}
        onClose={() => setSelected(null)}
        onChanged={query.refresh}
        navigation={navigation}
      />
    </Screen>
  );
}
