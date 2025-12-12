import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

// Recebemos a prop 'navigation' automaticamente
export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  // Configura o ícone no cabeçalho antes de renderizar a tela
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }} // Margem para não colar na borda
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={30} color="#0000ff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Financeiro</Text>
      <Text style={styles.subtitle}>Olá, {user?.email}</Text>

      <View style={styles.content}>
        <Text style={styles.infoText}>
          Aqui você visualizará seus gráficos e consultas.
        </Text>
        <Ionicons
          name="stats-chart"
          size={80}
          color="#ddd"
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoText: { fontSize: 18, color: "#888" },
});
