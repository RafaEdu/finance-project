import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinanceQuery } from "../../hooks/useFinanceQuery";
import { useTags } from "../../hooks/useTags";
import { getDateRange, formatTransactionDate } from "../../utils/date";
import { ui } from "../../constants/theme";
import { colors } from "../../constants/colors";
import ScreenHeader from "../../components/ScreenHeader";
import PeriodPicker from "../../components/PeriodPicker";
import FormField from "../../components/FormField";
import ChoiceGroup from "../../components/ChoiceGroup";
import Sheet from "../../components/Sheet";
import MoneyText from "../../components/MoneyText";
import TransactionCard from "../../components/TransactionCard";
import TransactionDetails from "../../components/TransactionDetails";
import AppButton from "../../components/AppButton";
import NewTransactionButton from "../../components/NewTransactionButton";
import ErrorState from "../../components/ErrorState";
import LoadingView from "../../components/LoadingView";
import EmptyState from "../../components/EmptyState";
export default function TransactionsScreen({ navigation, route }) {
  const incomingKey = `${route.params?.selectionKey || ""}:${route.params?.initialDate || ""}:${route.params?.initialPeriod || ""}`;
  const [periodState, setPeriodState] = useState(() => ({
    key: incomingKey,
    date: new Date(route.params?.initialDate || Date.now()),
    period: route.params?.initialPeriod || "month",
  }));
  const chosen =
    periodState.key === incomingKey
      ? periodState
      : {
          date: new Date(route.params.initialDate),
          period: route.params.initialPeriod || "month",
        };
  const { date, period } = chosen;
  const setDate = (next) =>
    setPeriodState({ key: incomingKey, date: next, period });
  const setPeriod = (next) =>
    setPeriodState({ key: incomingKey, date, period: next });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [tagId, setTagId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { tags, loading: tagsLoading, error: tagsError } = useTags();
  const effectiveTagId =
    tagId && !tagsLoading && !tagsError && !tags.some((tag) => tag.id === tagId)
      ? null
      : tagId;
  const query = useFinanceQuery({
    ...getDateRange(date, period),
    search,
    type,
    status,
    tagId: effectiveTagId,
  });
  const sections = useMemo(() => {
    const groups = new Map();
    (query.data?.items || []).forEach((item) => {
      const title = formatTransactionDate(item.date);
      if (!groups.has(title)) groups.set(title, []);
      groups.get(title).push(item);
    });
    return [...groups].map(([title, data]) => ({ title, data }));
  }, [query.data?.items]);
  const clear = () => {
    setType("all");
    setStatus("all");
    setTagId(null);
    setSearch("");
  };
  const activeCount = [
    type !== "all",
    status !== "all",
    !!effectiveTagId,
  ].filter(Boolean).length;
  const header = (
    <View style={{ gap: 16, marginBottom: 16 }}>
      <ScreenHeader
        title="Movimentações"
        subtitle="Encontre e confira seus lançamentos."
        privacy
      />
      <PeriodPicker
        date={date}
        type={period}
        onDateChange={setDate}
        onTypeChange={setPeriod}
      />
      <FormField
        value={search}
        onChangeText={setSearch}
        placeholder="Pesquisar nome, descrição ou tag"
        accessibilityLabel="Pesquisar movimentações"
      />
      <View style={ui.between}>
        <TouchableOpacity
          onPress={() => setFiltersOpen(true)}
          accessibilityRole="button"
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={ui.link}>
            Filtros{activeCount ? ` (${activeCount})` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={clear}
          accessibilityRole="button"
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={ui.link}>Limpar filtros</Text>
        </TouchableOpacity>
      </View>
      <NewTransactionButton navigation={navigation} />
      {query.error ? (
        <ErrorState onRetry={query.refresh} />
      ) : query.data ? (
        <View style={[ui.card, { padding: 16 }]}>
          <Text style={ui.label}>
            {query.data.total} resultado(s) em todo o filtro
          </Text>
          <View style={[ui.between, { flexWrap: "wrap" }]}>
            <Text style={ui.muted}>Resultado previsto</Text>
            <MoneyText
              value={query.data.summary.balance}
              style={[ui.heading, { fontSize: 20 }]}
            />
          </View>
        </View>
      ) : (
        <LoadingView />
      )}
    </View>
  );
  return (
    <SafeAreaView style={ui.screen} edges={["top", "left", "right"]}>
      <SectionList
        contentContainerStyle={ui.content}
        sections={query.error ? [] : sections}
        keyExtractor={(item) => `${item.type}:${item.id}`}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={query.refreshing}
            onRefresh={query.refresh}
          />
        }
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              ui.label,
              { paddingVertical: 12, backgroundColor: colors.background },
            ]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            tag={tags.find((tag) => tag.id === item.tagId)}
            onPress={setSelected}
          />
        )}
        ListEmptyComponent={
          query.data && !query.error ? (
            <EmptyState text="Nenhum lançamento neste filtro. Tente outro período ou limpe os filtros." />
          ) : null
        }
        ListFooterComponent={
          query.hasMore && !query.error ? (
            <AppButton
              title="Carregar mais"
              variant="neutral"
              loading={query.loadingMore}
              onPress={query.loadMore}
            />
          ) : null
        }
      />
      <Sheet
        visible={filtersOpen}
        title="Filtrar movimentações"
        onClose={() => setFiltersOpen(false)}
      >
        <Text style={ui.label}>Tipo</Text>
        <ChoiceGroup
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "Todos" },
            { value: "income", label: "Receitas" },
            { value: "expense", label: "Despesas" },
          ]}
        />
        <Text style={ui.label}>Situação</Text>
        <ChoiceGroup
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Qualquer situação" },
            { value: "settled", label: "Realizados" },
            { value: "pending", label: "Pendentes" },
          ]}
        />
        <Text style={ui.label}>Tag</Text>
        <ChoiceGroup
          value={effectiveTagId}
          onChange={setTagId}
          options={[
            { value: null, label: "Todas as tags" },
            ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
          ]}
        />
        <AppButton
          title="Ver resultados"
          onPress={() => setFiltersOpen(false)}
        />
      </Sheet>
      <TransactionDetails
        transaction={selected}
        onClose={() => setSelected(null)}
        navigation={navigation}
        onChanged={query.refresh}
      />
    </SafeAreaView>
  );
}
