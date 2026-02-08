import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { styles } from "./InsightsScreen.styles";

export default function InsightsScreen({ navigation }) {
  const { user } = useAuth();

  // Loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tags
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);

  // Period filter
  const [filterType, setFilterType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Summary (period)
  const [periodIncome, setPeriodIncome] = useState(0);
  const [periodExpense, setPeriodExpense] = useState(0);
  const [periodBalance, setPeriodBalance] = useState(0);

  // All-time totals
  const [allTimeIncome, setAllTimeIncome] = useState(0);
  const [allTimeExpense, setAllTimeExpense] = useState(0);
  const [allTimeBalance, setAllTimeBalance] = useState(0);

  // Transactions
  const [transactions, setTransactions] = useState([]);

  // --- Helpers ---

  const getDateRange = (date, type) => {
    const start = new Date(date);
    const end = new Date(date);

    if (type === "day") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (type === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (type === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    }

    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDisplayDate = () => {
    if (filterType === "day") return currentDate.toLocaleDateString("pt-BR");
    if (filterType === "month")
      return currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    if (filterType === "year") return currentDate.getFullYear().toString();
  };

  const formatTransactionDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // --- Data Fetching ---

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("nome", { ascending: true });

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar as tags.");
    } else {
      const loadedTags = data || [];
      setTags(loadedTags);

      // Reset selection if the selected tag was deleted
      if (selectedTagId && !loadedTags.find((t) => t.id === selectedTagId)) {
        setSelectedTagId(null);
      }
    }
  };

  const fetchAllTimeTotals = async (tagId) => {
    try {
      const { data: allIncomes } = await supabase
        .from("receita")
        .select("valor")
        .eq("user_id", user.id)
        .eq("tag_id", tagId);

      const { data: allExpenses } = await supabase
        .from("despesa")
        .select("valor")
        .eq("user_id", user.id)
        .eq("tag_id", tagId);

      const totalIncome = (allIncomes || []).reduce(
        (acc, curr) => acc + Number(curr.valor),
        0,
      );
      const totalExpense = (allExpenses || []).reduce(
        (acc, curr) => acc + Number(curr.valor),
        0,
      );

      setAllTimeIncome(totalIncome);
      setAllTimeExpense(totalExpense);
      setAllTimeBalance(totalIncome - totalExpense);
    } catch (error) {
      // Silently ignore all-time totals error
    }
  };

  const fetchInsightsData = async () => {
    if (!selectedTagId) {
      setPeriodIncome(0);
      setPeriodExpense(0);
      setPeriodBalance(0);
      setAllTimeIncome(0);
      setAllTimeExpense(0);
      setAllTimeBalance(0);
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { startISO, endISO } = getDateRange(currentDate, filterType);

      // Fetch incomes for selected tag in the period
      const { data: incomes, error: incomeError } = await supabase
        .from("receita")
        .select("*")
        .eq("user_id", user.id)
        .eq("tag_id", selectedTagId)
        .gte("data_transacao", startISO)
        .lte("data_transacao", endISO)
        .order("data_transacao", { ascending: false });

      if (incomeError) throw incomeError;

      // Fetch expenses for selected tag in the period
      const { data: expenses, error: expenseError } = await supabase
        .from("despesa")
        .select("*")
        .eq("user_id", user.id)
        .eq("tag_id", selectedTagId)
        .gte("data_transacao", startISO)
        .lte("data_transacao", endISO)
        .order("data_transacao", { ascending: false });

      if (expenseError) throw expenseError;

      const safeIncomes = incomes || [];
      const safeExpenses = expenses || [];

      const sumIncome = safeIncomes.reduce(
        (acc, curr) => acc + Number(curr.valor),
        0,
      );
      const sumExpense = safeExpenses.reduce(
        (acc, curr) => acc + Number(curr.valor),
        0,
      );

      setPeriodIncome(sumIncome);
      setPeriodExpense(sumExpense);
      setPeriodBalance(sumIncome - sumExpense);

      // Merge and sort transactions
      const formattedIncomes = safeIncomes.map((i) => ({
        ...i,
        type: "income",
      }));
      const formattedExpenses = safeExpenses.map((e) => ({
        ...e,
        type: "expense",
      }));

      const allTransactions = [...formattedIncomes, ...formattedExpenses];
      allTransactions.sort(
        (a, b) => new Date(b.data_transacao) - new Date(a.data_transacao),
      );
      setTransactions(allTransactions);

      // Fetch all-time totals
      await fetchAllTimeTotals(selectedTagId);
    } catch (error) {
      console.log("Erro ao carregar insights:", error.message || error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Effects ---

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchInsightsData();
    }, [selectedTagId, currentDate, filterType]),
  );

  // --- Event Handlers ---

  const onRefresh = () => {
    setRefreshing(true);
    fetchTags();
    fetchInsightsData();
  };

  const changeDate = (direction) => {
    const newDate = new Date(currentDate);
    if (filterType === "day") newDate.setDate(newDate.getDate() + direction);
    else if (filterType === "month")
      newDate.setMonth(newDate.getMonth() + direction);
    else if (filterType === "year")
      newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const handleDatePickerChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setCurrentDate(selectedDate);
  };

  const handleTagSelect = (tagId) => {
    if (selectedTagId === tagId) {
      setSelectedTagId(null);
    } else {
      setSelectedTagId(tagId);
    }
  };

  // --- Render Helpers ---

  const renderTransactionItem = (item) => {
    const isIncome = item.type === "income";
    const hasMultipleOccurrences = item.parcela_total && item.parcela_total > 1;
    const isRecurrence = isIncome && hasMultipleOccurrences;
    const isInstallment = !isIncome && hasMultipleOccurrences;

    const tag = tags.find((t) => t.id === item.tag_id);

    return (
      <View key={`${item.type}-${item.id}`} style={styles.transactionCard}>
        <View style={styles.iconWrapper}>
          <Ionicons
            name={isIncome ? "arrow-up-circle" : "arrow-down-circle"}
            size={24}
            color={isIncome ? "#27ae60" : "#e74c3c"}
          />
        </View>

        <View style={styles.transactionInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.transactionTitle}>{item.descricao}</Text>
            {isRecurrence && (
              <View style={styles.recurrenceBadge}>
                <Text style={styles.recurrenceText}>
                  Receita {item.parcela_atual}/{item.parcela_total}
                </Text>
              </View>
            )}
            {isInstallment && (
              <View style={styles.installmentBadge}>
                <Text style={styles.installmentText}>
                  Parcela {item.parcela_atual}/{item.parcela_total}
                </Text>
              </View>
            )}
            {tag && (
              <View
                style={[
                  styles.tagBadge,
                  { backgroundColor: tag.cor || "#2980b9" },
                ]}
              >
                <Text
                  style={[
                    styles.tagBadgeText,
                    { color: tag.cor_texto || "#ffffff" },
                  ]}
                >
                  {tag.nome}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.transactionDate}>
            {formatTransactionDate(item.data_transacao)}
          </Text>
        </View>

        <Text
          style={[
            styles.transactionValue,
            { color: isIncome ? "#27ae60" : "#e74c3c" },
          ]}
        >
          {isIncome ? "+" : "-"} {formatCurrency(Number(item.valor))}
        </Text>
      </View>
    );
  };

  // --- Loading State ---

  if (loading && !refreshing && tags.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // --- Main Render ---

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Tag Picker */}
        <View style={styles.tagPickerContainer}>
          <Text style={styles.tagPickerLabel}>Filtrar por tag:</Text>

          {tags.length === 0 ? (
            <Text style={styles.noTagsText}>
              Nenhuma tag cadastrada. Crie tags para usar os Insights.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.clearTagButton,
                  !selectedTagId && styles.clearTagButtonActive,
                ]}
                onPress={() => setSelectedTagId(null)}
              >
                <Text style={styles.clearTagText}>Todas</Text>
              </TouchableOpacity>

              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    { backgroundColor: tag.cor || "#2980b9" },
                    selectedTagId === tag.id && styles.tagChipSelected,
                  ]}
                  onPress={() => handleTagSelect(tag.id)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      { color: tag.cor_texto || "#ffffff" },
                    ]}
                  >
                    {tag.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Period Filter (only when tag selected) */}
        {selectedTagId && (
          <>
            <View style={styles.filterContainer}>
              {["day", "month", "year"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    filterType === type && styles.activeFilterButton,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterType === type && styles.activeFilterText,
                    ]}
                  >
                    {type === "day" ? "Dia" : type === "month" ? "Mês" : "Ano"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateNavContainer}>
              <TouchableOpacity
                onPress={() => changeDate(-1)}
                style={styles.dateNavButton}
              >
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateNavText}>{formatDisplayDate()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeDate(1)}
                style={styles.dateNavButton}
              >
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="default"
                onChange={handleDatePickerChange}
              />
            )}
          </>
        )}

        {/* Summary Section (only when tag selected) */}
        {selectedTagId && !loading && (
          <>
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, styles.incomeCard]}>
                <Ionicons name="trending-up" size={24} color="#27ae60" />
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: "#27ae60" }]}>
                  {formatCurrency(periodIncome)}
                </Text>
              </View>
              <View style={[styles.summaryCard, styles.expenseCard]}>
                <Ionicons name="trending-down" size={24} color="#e74c3c" />
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: "#e74c3c" }]}>
                  {formatCurrency(periodExpense)}
                </Text>
              </View>
            </View>

            <View style={styles.netBalanceCard}>
              <Text style={styles.netBalanceLabel}>
                {filterType === "day"
                  ? "Saldo do Dia"
                  : filterType === "month"
                    ? "Saldo do Mês"
                    : "Saldo do Ano"}
              </Text>
              <Text
                style={[
                  styles.netBalanceValue,
                  {
                    color: periodBalance >= 0 ? "#2ecc71" : "#e74c3c",
                  },
                ]}
              >
                {formatCurrency(periodBalance)}
              </Text>
            </View>

            <View style={styles.allTimeContainer}>
              <Text style={styles.allTimeTitle}>Totais desde o início</Text>
              <View style={styles.allTimeRow}>
                <Text style={styles.allTimeLabel}>Receitas:</Text>
                <Text style={[styles.allTimeValue, { color: "#27ae60" }]}>
                  {formatCurrency(allTimeIncome)}
                </Text>
              </View>
              <View style={styles.allTimeRow}>
                <Text style={styles.allTimeLabel}>Despesas:</Text>
                <Text style={[styles.allTimeValue, { color: "#e74c3c" }]}>
                  {formatCurrency(allTimeExpense)}
                </Text>
              </View>
              <View style={styles.allTimeRow}>
                <Text style={styles.allTimeLabel}>Saldo:</Text>
                <Text
                  style={[
                    styles.allTimeValue,
                    {
                      color: allTimeBalance >= 0 ? "#27ae60" : "#e74c3c",
                    },
                  ]}
                >
                  {formatCurrency(allTimeBalance)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Transaction History (only when tag selected) */}
        {selectedTagId && !loading && (
          <>
            <Text style={styles.sectionTitle}>Histórico de Movimentações</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma movimentação encontrada para esta tag no período.
                </Text>
              </View>
            ) : (
              <View>
                {transactions.map((item) => renderTransactionItem(item))}
              </View>
            )}
          </>
        )}

        {/* No Tag Selected State */}
        {!selectedTagId && tags.length > 0 && (
          <View style={styles.noTagSelectedContainer}>
            <Ionicons name="analytics-outline" size={60} color="#bdc3c7" />
            <Text style={styles.noTagSelectedText}>
              Selecione uma tag acima para ver os insights.
            </Text>
          </View>
        )}

        {/* Loading indicator when fetching data for a selected tag */}
        {selectedTagId && loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
