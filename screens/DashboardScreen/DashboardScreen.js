import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

import { styles } from "./DashboardScreen.styles";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  // Configura o ícone no cabeçalho antes de renderizar a tela
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.profileIcon} // Usando o estilo importado
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
