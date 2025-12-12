import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./ProfileScreen.styles";

export default function ProfileScreen() {
  const { user } = useAuth();

  // Estados para o formulário de senha
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica de Logout com Confirmação
  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  // Lógica de Alterar Senha
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Alert.alert("Erro ao atualizar", error.message);
    } else {
      Alert.alert("Sucesso", "Sua senha foi alterada!");
      setNewPassword(""); // Limpa o campo
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* --- Cabeçalho do Perfil --- */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* --- Seção de Segurança --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança</Text>
        <Text style={styles.label}>Alterar Senha</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nova senha"
            secureTextEntry={!showPassword} // Oculta ou mostra
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <Button
          title={loading ? "Atualizando..." : "Atualizar Senha"}
          onPress={handleChangePassword}
          disabled={loading}
        />
      </View>

      {/* --- Botão de Sair --- */}
      <View style={styles.logoutContainer}>
        <Button title="Sair (Logout)" color="#e74c3c" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
