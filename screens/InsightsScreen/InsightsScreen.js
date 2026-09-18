import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./InsightsScreen.styles";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/currency";
import { getDateRange } from "../../utils/date";
import { useTags } from "../../hooks/useTags";
import { useTransactions } from "../../hooks/useTransactions";
import { getSums } from "../../services/transactionsService";
import LoadingView from "../../components/LoadingView";
import EmptyState from "../../components/EmptyState";
import PeriodFilter from "../../components/PeriodFilter";
import DateNavigator from "../../components/DateNavigator";
import TransactionCard from "../../components/TransactionCard";

export default function InsightsScreen() {
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();

  // Tags
  const { tags, refresh: refreshTags } = useTags();
  const [selectedTagId, setSelectedTagId] = useState(null);

  // Period filter
  const [filterType, setFilterType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // All-time totals
  const [allTimeIncome, setAllTimeIncome] = useState(0);
  const [allTimeExpense, setAllTimeExpense] = useState(0);
  const [allTimeBalance, setAllTimeBalance] = useState(0);

  const { startISO, endISO } = getDateRange(currentDate, filterType);
  const {
    transactions,
    loading,
    refreshing,
    refresh: refreshTransactions,
  } = useTransactions({
    startISO,
    endISO,
    tagId: selectedTagId,
    enabled: !!selectedTagId,
  });

  const periodIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const periodExpense = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const periodBalance = periodIncome - periodExpense;

  // --- Effects ---

  // Reset selection if the selected tag was deleted
  useEffect(() => {
    if (
      selectedTagId &&
      tags.length > 0 &&
      !tags.find((t) => t.id === selectedTagId)
    ) {
      setSelectedTagId(null);
    }
  }, [tags, selectedTagId]);

  // All-time totals for the selected tag
  useEffect(() => {
    if (!selectedTagId || !user?.id) {
      setAllTimeIncome(0);
      setAllTimeExpense(0);
      setAllTimeBalance(0);
      return;
    }

    let active = true;
    getSums(user.id, { tagId: selectedTagId }).then(({ data }) => {
      if (active && data) {
        setAllTimeIncome(data.income);
        setAllTimeExpense(data.expense);
        setAllTimeBalance(data.balance);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.id, selectedTagId, transactions]);

  // --- Event Handlers ---

  const onRefresh = () => {
    refreshTags();
    refreshTransactions();
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

  // --- Loading State ---

  if (loading && !refreshing && tags.length === 0) {
    return <LoadingView fullScreen />;
  }

  // --- Main Render ---

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
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
                    { backgroundColor: tag.color || colors.accent },
                    selectedTagId === tag.id && styles.tagChipSelected,
                  ]}
                  onPress={() => handleTagSelect(tag.id)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      { color: tag.textColor || colors.white },
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Period Filter (only when tag selected) */}
        {selectedTagId && (
          <>
            <PeriodFilter value={filterType} onChange={setFilterType} />

            <DateNavigator
              date={currentDate}
              type={filterType}
              onChange={setCurrentDate}
              onPressDate={() => setShowDatePicker(true)}
            />

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
                <Ionicons name="trending-up" size={24} color={colors.income} />
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: colors.income }]}>
                  {formatCurrency(periodIncome)}
                </Text>
              </View>
              <View style={[styles.summaryCard, styles.expenseCard]}>
                <Ionicons
                  name="trending-down"
                  size={24}
                  color={colors.expense}
                />
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: colors.expense }]}>
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
                    color:
                      periodBalance >= 0 ? colors.positive : colors.expense,
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
                <Text style={[styles.allTimeValue, { color: colors.income }]}>
                  {formatCurrency(allTimeIncome)}
                </Text>
              </View>
              <View style={styles.allTimeRow}>
                <Text style={styles.allTimeLabel}>Despesas:</Text>
                <Text style={[styles.allTimeValue, { color: colors.expense }]}>
                  {formatCurrency(allTimeExpense)}
                </Text>
              </View>
              <View style={styles.allTimeRow}>
                <Text style={styles.allTimeLabel}>Saldo:</Text>
                <Text
                  style={[
                    styles.allTimeValue,
                    {
                      color:
                        allTimeBalance >= 0 ? colors.income : colors.expense,
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
              <EmptyState text="Nenhuma movimentação encontrada para esta tag no período." />
            ) : (
              <View>
                {transactions.map((item) => (
                  <TransactionCard
                    key={`${item.type}-${item.id}`}
                    transaction={item}
                    tag={tags.find((t) => t.id === item.tagId)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* No Tag Selected State */}
        {!selectedTagId && tags.length > 0 && (
          <EmptyState
            icon="analytics-outline"
            text="Selecione uma tag acima para ver os insights."
            style={styles.noTagSelectedContainer}
          />
        )}

        {/* Loading indicator when fetching data for a selected tag */}
        {selectedTagId && loading && !refreshing && <LoadingView />}
      </ScrollView>
    </View>
  );
}
