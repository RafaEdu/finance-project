import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./HomeScreen.styles";

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
