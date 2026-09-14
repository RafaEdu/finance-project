import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./DashboardScreen.styles";
import { colors } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import { formatCurrency } from "../../utils/currency";
import { getDateRange } from "../../utils/date";
import { removeAccents } from "../../utils/string";
import { useTags } from "../../hooks/useTags";
import { useTransactions } from "../../hooks/useTransactions";
import { deleteTransaction, getSums } from "../../services/transactionsService";
import { confirmDestructive } from "../../components/ConfirmDialog";
import LoadingView from "../../components/LoadingView";
import EmptyState from "../../components/EmptyState";
import PeriodFilter from "../../components/PeriodFilter";
import DateNavigator from "../../components/DateNavigator";
import TransactionCard from "../../components/TransactionCard";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  // Estados de Filtro
  const [filterType, setFilterType] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estado da Pesquisa
  const [searchText, setSearchText] = useState("");

  // Estado de Visibilidade do Saldo (Persistente)
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // Estado de saldo mensal acumulado
  const [monthToDateBalance, setMonthToDateBalance] = useState(0);

  const { tags, refresh: refreshTags } = useTags();
  const { startISO, endISO } = getDateRange(currentDate, filterType);
  const {
    transactions,
    loading,
    refreshing,
    refresh: refreshTransactions,
  } = useTransactions({ startISO, endISO });

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0];

  const tagsMap = useMemo(() => {
    const map = {};
    tags.forEach((tag) => {
      map[tag.id] = tag;
    });
    return map;
  }, [tags]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => acc + item.amount, 0),
    [transactions],
  );

  const balance = totalIncome - totalExpense;

  useEffect(() => {
    const loadBalanceSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("@balance_visible");
        if (storedValue !== null) {
          setIsBalanceVisible(JSON.parse(storedValue));
        }
      } catch (e) {
        console.error("Erro ao carregar configuração de saldo:", e);
      }
    };
    loadBalanceSettings();
  }, []);

  const toggleBalanceVisibility = async () => {
    const newValue = !isBalanceVisible;
    setIsBalanceVisible(newValue);
    try {
      await AsyncStorage.setItem("@balance_visible", JSON.stringify(newValue));
    } catch (e) {
      console.error("Erro ao salvar configuração de saldo:", e);
    }
  };

  useEffect(() => {
    if (filterType !== "day" || !user?.id) return;

    let active = true;
    const startOfMonth = new Date(currentDate);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    getSums(user.id, {
      startISO: startOfMonth.toISOString(),
      endISO: endOfDay.toISOString(),
    }).then(({ data }) => {
      if (active && data) setMonthToDateBalance(data.balance);
    });

    return () => {
      active = false;
    };
  }, [user?.id, currentDate, filterType, transactions]);

  const handleEdit = (item) => {
    const screenName =
      item.type === "income" ? ROUTES.newIncome : ROUTES.newExpense;
    navigation.navigate(screenName, { transactionToEdit: item });
  };

  const handleDelete = (item) => {
    confirmDestructive({
      title: "Confirmar Exclusão",
      message: `Deseja excluir esta ${
        item.type === "income" ? "receita" : "despesa"
      }?`,
      onConfirm: async () => {
        const { error } = await deleteTransaction(item.type, item.id);

        if (error) {
          Alert.alert("Erro", `Não foi possível excluir: ${error.message}`);
        } else {
          refreshTransactions();
        }
      },
    });
  };

  const onRefresh = () => {
    refreshTags();
    refreshTransactions();
  };

  const handleDatePickerChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setCurrentDate(selectedDate);
  };

  const filteredTransactions = transactions.filter((item) => {
    const search = removeAccents(searchText.toLowerCase());
    const name = removeAccents((item.name || "").toLowerCase());
    const description = removeAccents((item.description || "").toLowerCase());
    return name.includes(search) || description.includes(search);
  });

  if (loading && !refreshing && transactions.length === 0) {
    return <LoadingView fullScreen />;
  }

  return (
    // Implementação do KeyboardAvoidingView com OFFSET para corrigir o problema da barra escondida
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset compensa a altura do Header + Status Bar (aprox 100px no iOS)
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.flex1}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // Garante que toques nos itens da lista funcionem mesmo com teclado aberto
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.greeting}>Olá, {displayName}</Text>

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

          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <Ionicons name="trending-up" size={24} color={colors.income} />
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Ionicons name="trending-down" size={24} color={colors.expense} />
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.balanceToggleContainer}
            onPress={toggleBalanceVisibility}
          >
            <Text style={styles.balanceToggleText}>
              {isBalanceVisible ? "Ocultar Saldo Total" : "Ver Saldo Total"}
            </Text>
            <Ionicons
              name={isBalanceVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isBalanceVisible && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>
                {filterType === "day" ? "Saldo do Dia" : "Saldo do Período"}
              </Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
              {filterType === "day" && (
                <View style={styles.secondaryBalanceContainer}>
                  <Text style={styles.balanceLabel}>
                    SALDO MENSAL ACUMULADO
                  </Text>
                  <Text style={[styles.balanceValue, { fontSize: 22 }]}>
                    {formatCurrency(monthToDateBalance)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>
            {filterType === "day"
              ? "Movimentações do Dia"
              : "Histórico do Período"}
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.placeholder}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar movimentação..."
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            )}
          </View>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              text={
                transactions.length === 0
                  ? "Nenhuma transação encontrada."
                  : "Nenhum resultado para a pesquisa."
              }
            />
          ) : (
            <View>
              {filteredTransactions.map((item) => (
                <TransactionCard
                  key={`${item.type}-${item.id}`}
                  transaction={item}
                  tag={item.tagId ? tagsMap[item.tagId] : null}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
