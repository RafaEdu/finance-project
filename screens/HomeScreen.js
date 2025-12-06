import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Finance Project!</Text>
      <Text style={styles.subtitle}>Logado como: {user?.email}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Sair (Logout)"
          color="red"
          onPress={() => supabase.auth.signOut()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30 },
  buttonContainer: { width: "100%", marginTop: 20 },
});
