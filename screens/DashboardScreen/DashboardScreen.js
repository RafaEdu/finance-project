import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { styles } from "./DashboardScreen.styles";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para dados
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Configuração do Header (Botão de Perfil)
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

  // Função principal de busca de dados
  const fetchDashboardData = async () => {
    try {
      // 1. Buscar Receitas
      const { data: incomes, error: incomeError } = await supabase
        .from("receita")
        .select("*")
        .eq("user_id", user.id)
        .order("data_transacao", { ascending: false });

      if (incomeError) throw incomeError;

      // 2. Buscar Despesas
      const { data: expenses, error: expenseError } = await supabase
        .from("despesa")
        .select("*")
        .eq("user_id", user.id)
        .order("data_transacao", { ascending: false });

      if (expenseError) throw expenseError;

      // 3. Calcular Totais
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

      // 4. Mesclar e ordenar transações para o histórico recente
      const formattedIncomes = incomes.map((i) => ({ ...i, type: "income" }));
      const formattedExpenses = expenses.map((e) => ({
        ...e,
        type: "expense",
      }));

      const allTransactions = [...formattedIncomes, ...formattedExpenses];

      // Ordenar por data (mais recente primeiro)
      allTransactions.sort(
        (a, b) => new Date(b.data_transacao) - new Date(a.data_transacao)
      );

      setRecentTransactions(allTransactions.slice(0, 10)); // Pegar apenas as 10 últimas
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect carrega os dados sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Função auxiliar para formatar moeda
  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função auxiliar para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Renderização de cada item da lista
  const renderTransactionItem = ({ item }) => {
    const isIncome = item.type === "income";
    return (
      <View style={styles.transactionCard}>
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
            {formatDate(item.data_transacao)}
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.greeting}>Olá, {user?.email?.split("@")[0]}</Text>

        {/* --- Card de Saldo Total --- */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        </View>

        {/* --- Resumo Receitas vs Despesas --- */}
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

        {/* --- Lista de Transações Recentes --- */}
        <Text style={styles.sectionTitle}>Últimas Movimentações</Text>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        ) : (
          /* Como estamos dentro de um ScrollView, usamos map em vez de FlatList 
                ou desativamos a scrollagem da FlatList interna */
          <View>
            {recentTransactions.map((item) => (
              <View key={`${item.type}-${item.id}`}>
                {renderTransactionItem({ item })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
