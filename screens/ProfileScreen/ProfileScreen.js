import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./ProfileScreen.styles"; // Certifique-se que o arquivo de estilos existe

export default function ProfileScreen() {
  const { user } = useAuth();

  // Estado para o Nome (Inicializado com o metadata existente ou vazio)
  const [name, setName] = useState("");

  // Estados para o formulário de senha
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState(false);

  // Carregar o nome atual ao abrir a tela
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  // Lógica de Logout
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

  // --- NOVA FUNÇÃO: Atualizar Nome (Metadata) ---
  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }

    setLoadingName(true);

    // Atualiza apenas os metadados, sem mexer em email/senha
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso", "Nome atualizado!");
    }
    setLoadingName(false);
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
      setNewPassword("");
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

      {/* --- NOVA SEÇÃO: Dados Pessoais --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <Text style={styles.label}>Nome de Exibição</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.eyeIcon}>
            <Ionicons name="pencil" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <Button
          title={loadingName ? "Salvando..." : "Salvar Nome"}
          onPress={handleUpdateName}
          disabled={loadingName}
        />
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
            secureTextEntry={!showPassword}
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
