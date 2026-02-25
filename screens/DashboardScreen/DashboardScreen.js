import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { styles } from "./DashboardScreen.styles";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  // loading inicia true para mostrar spinner APENAS na primeira renderização
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Filtro
  const [filterType, setFilterType] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estado da Pesquisa
  const [searchText, setSearchText] = useState("");

  // Estado de Visibilidade do Saldo (Persistente)
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // Estados de Dados
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [monthToDateBalance, setMonthToDateBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tagsMap, setTagsMap] = useState({});

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0];

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

  const fetchUserTags = async () => {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id);
    if (data) {
      const map = {};
      data.forEach((tag) => {
        map[tag.id] = tag;
      });
      setTagsMap(map);
    }
  };

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      const { startISO, endISO } = getDateRange(currentDate, filterType);

      // 0. Busca Tags do usuário
      await fetchUserTags();

      // 1. Busca Receitas
      const { data: incomes, error: incomeError } = await supabase
        .from("receita")
        .select("*")
        .eq("user_id", user.id)
        .gte("data_transacao", startISO)
        .lte("data_transacao", endISO)
        .order("data_transacao", { ascending: false });

      if (incomeError) throw incomeError;

      // 2. Busca Despesas
      const { data: expenses, error: expenseError } = await supabase
        .from("despesa")
        .select("*")
        .eq("user_id", user.id)
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

      setTotalIncome(sumIncome);
      setTotalExpense(sumExpense);
      setBalance(sumIncome - sumExpense);

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

      if (filterType === "day") {
        await fetchMonthToDateBalance(currentDate);
      }
    } catch (error) {
      // Lógica de Retry Silencioso para Token Expirado (JWT)
      const errorString = JSON.stringify(error).toLowerCase();
      const isJwtError =
        errorString.includes("jwt") ||
        (error.message && error.message.toLowerCase().includes("jwt"));

      if (isJwtError && retryCount < 3) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          return fetchDashboardData(retryCount + 1);
        }
      }
      console.log("Erro ao carregar dashboard:", error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthToDateBalance = async (selectedDate) => {
    try {
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
        0,
      );
      const sumMonthExpense = (monthExpenses || []).reduce(
        (acc, curr) => acc + Number(curr.valor),
        0,
      );

      setMonthToDateBalance(sumMonthIncome - sumMonthExpense);
    } catch (error) {
      // Ignora erro de saldo mensal silenciosamente
    }
  };

  const handleEdit = (item) => {
    const screenName = item.type === "income" ? "Nova Receita" : "Nova Despesa";
    navigation.navigate(screenName, { transactionToEdit: item });
  };

  const handleDelete = (item) => {
    console.log("handleDelete chamado para:", item.id, item.type);

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir esta ${item.type === "income" ? "receita" : "despesa"}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("Cancelado"),
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            console.log("Confirmado - iniciando exclusão");
            setLoading(true);
            const tableName = item.type === "income" ? "receita" : "despesa";

            try {
              console.log("Deletando da tabela:", tableName, "id:", item.id);
              const { error } = await supabase
                .from(tableName)
                .delete()
                .eq("id", item.id);

              console.log(
                "Resultado do delete:",
                error ? error.message : "Sucesso",
              );

              if (error) {
                Alert.alert(
                  "Erro",
                  `Não foi possível excluir: ${error.message}`,
                );
              } else {
                fetchDashboardData();
              }
            } catch (e) {
              console.log("Erro catch:", e.message);
              Alert.alert("Erro", "Falha de conexão.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [currentDate, filterType]),
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

  // Função para remover acentos de uma string
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredTransactions = transactions.filter((item) => {
    const descricao = removeAccents((item.descricao || "").toLowerCase());
    const search = removeAccents(searchText.toLowerCase());
    return descricao.includes(search);
  });

  if (
    loading &&
    !refreshing &&
    transactions.length === 0 &&
    totalIncome === 0
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderTransactionItem = (item) => {
    const isIncome = item.type === "income";
    const hasMultipleOccurrences = item.parcela_total && item.parcela_total > 1;

    // Diferencia: Receitas com múltiplas ocorrências são "recorrências", despesas são "parcelas"
    const isRecurrence = isIncome && hasMultipleOccurrences;
    const isInstallment = !isIncome && hasMultipleOccurrences;

    // Tag associada
    const tag = item.tag_id ? tagsMap[item.tag_id] : null;

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

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              styles.transactionValue,
              { color: isIncome ? "#27ae60" : "#e74c3c" },
            ]}
          >
            {isIncome ? "+" : "-"} {formatCurrency(Number(item.valor))}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.actionButton}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={20} color="#f39c12" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.actionButton}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    // Implementação do KeyboardAvoidingView com OFFSET para corrigir o problema da barra escondida
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset compensa a altura do Header + Status Bar (aprox 100px no iOS)
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={{ flex: 1 }}
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
              color="#666"
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
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar movimentação..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? "Nenhuma transação encontrada."
                  : "Nenhum resultado para a pesquisa."}
              </Text>
            </View>
          ) : (
            <View>
              {filteredTransactions.map((item) => renderTransactionItem(item))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
