import React, { useState, useLayoutEffect, useCallback } from "react";
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
import { styles } from "./DashboardScreen.styles";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Filtro
  const [filterType, setFilterType] = useState("day"); // 'day', 'month', 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados de Dados
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [monthToDateBalance, setMonthToDateBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Configuração do Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={30} color="#0000ff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Função auxiliar de datas
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

  // Buscar Dados
  const fetchDashboardData = async () => {
    try {
      const { startISO, endISO } = getDateRange(currentDate, filterType);

      // 1. Buscar Receitas
      const { data: incomes, error: incomeError } = await supabase
        .from("receita")
        .select("*")
        .eq("user_id", user.id)
        .gte("data_transacao", startISO)
        .lte("data_transacao", endISO)
        .order("data_transacao", { ascending: false });

      if (incomeError) throw incomeError;

      // 2. Buscar Despesas
      const { data: expenses, error: expenseError } = await supabase
        .from("despesa")
        .select("*")
        .eq("user_id", user.id)
        .gte("data_transacao", startISO)
        .lte("data_transacao", endISO)
        .order("data_transacao", { ascending: false });

      if (expenseError) throw expenseError;

      // 3. Cálculos
      const sumIncome = incomes.reduce(
        (acc, curr) => acc + Number(curr.valor),
        0
      );
      const sumExpense = expenses.reduce(
        (acc, curr) => acc + Number(curr.valor),
        0
      );

      setTotalIncome(sumIncome);
      setTotalExpense(sumExpense);
      setBalance(sumIncome - sumExpense);

      // 4. Lista Unificada
      const formattedIncomes = incomes.map((i) => ({ ...i, type: "income" }));
      const formattedExpenses = expenses.map((e) => ({
        ...e,
        type: "expense",
      }));
      const allTransactions = [...formattedIncomes, ...formattedExpenses];

      allTransactions.sort(
        (a, b) => new Date(b.data_transacao) - new Date(a.data_transacao)
      );

      setTransactions(allTransactions);

      // 5. Saldo Acumulado (se filtro for dia)
      if (filterType === "day") {
        await fetchMonthToDateBalance(currentDate);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthToDateBalance = async (selectedDate) => {
    const startOfMonth = new Date(selectedDate);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startISO = startOfMonth.toISOString();
    const endISO = endOfDay.toISOString();

    const { data: monthIncomes } = await supabase
      .from("receita")
      .select("valor")
      .eq("user_id", user.id)
      .gte("data_transacao", startISO)
      .lte("data_transacao", endISO);

    const { data: monthExpenses } = await supabase
      .from("despesa")
      .select("valor")
      .eq("user_id", user.id)
      .gte("data_transacao", startISO)
      .lte("data_transacao", endISO);

    const sumMonthIncome = (monthIncomes || []).reduce(
      (acc, curr) => acc + Number(curr.valor),
      0
    );
    const sumMonthExpense = (monthExpenses || []).reduce(
      (acc, curr) => acc + Number(curr.valor),
      0
    );

    setMonthToDateBalance(sumMonthIncome - sumMonthExpense);
  };

  // Funções de Ação (Editar e Excluir)
  const handleEdit = (item) => {
    // Determina a tela correta baseada no tipo
    const screenName = item.type === "income" ? "Nova Receita" : "Nova Despesa";
    // Navega passando o item inteiro para ser editado
    navigation.navigate(screenName, { transactionToEdit: item });
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir esta ${item.type === "income" ? "receita" : "despesa"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const tableName = item.type === "income" ? "receita" : "despesa";

            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq("id", item.id);

            if (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            } else {
              // Recarrega os dados após excluir
              fetchDashboardData();
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [currentDate, filterType])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
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
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderTransactionItem = (item) => {
    const isIncome = item.type === "income";
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
          <Text style={styles.transactionTitle}>{item.descricao}</Text>
          <Text style={styles.transactionDate}>
            {formatTransactionDate(item.data_transacao)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              styles.transactionValue,
              { color: isIncome ? "#27ae60" : "#e74c3c" },
            ]}
          >
            {isIncome ? "+" : "-"} {formatCurrency(Number(item.valor))}
          </Text>

          {/* Botões de Ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#f39c12" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.greeting}>Olá, {user?.email?.split("@")[0]}</Text>

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

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            {filterType === "day" ? "Saldo do Dia" : "Saldo do Período"}
          </Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>

          {filterType === "day" && (
            <View style={styles.secondaryBalanceContainer}>
              <Text style={styles.balanceLabel}>Saldo do Mês (Acumulado)</Text>
              <Text style={[styles.balanceValue, { fontSize: 22 }]}>
                {formatCurrency(monthToDateBalance)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Ionicons name="trending-up" size={24} color="#27ae60" />
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: "#27ae60" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Ionicons name="trending-down" size={24} color="#e74c3c" />
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: "#e74c3c" }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {filterType === "day"
            ? "Movimentações do Dia"
            : "Histórico do Período"}
        </Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        ) : (
          <View>{transactions.map((item) => renderTransactionItem(item))}</View>
        )}
      </ScrollView>
    </View>
  );
}
