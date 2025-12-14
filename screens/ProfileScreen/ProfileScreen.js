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
import { styles } from "./ProfileScreen.styles";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

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

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }
    setLoadingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Nome atualizado!");
    setLoadingName(false);
  };

  // --- Lógica Ajustada de Alterar Senha ---
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    // Dispara o envio do código de recuperação para o email atual
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);

    setLoading(false);

    if (error) {
      Alert.alert("Erro ao enviar código", error.message);
    } else {
      // Navegação movida para dentro do onPress do Alert para garantir a leitura e o fluxo
      Alert.alert(
        "Verificação Enviada",
        `Um código de 6 dígitos foi enviado para ${user.email}. Digite-o na próxima tela para confirmar a nova senha.`,
        [
          {
            text: "OK, recebi o código",
            onPress: () => {
              navigation.navigate("VerifyCode", {
                email: user.email,
                type: "recovery",
                newPassword: newPassword,
              });
              setNewPassword(""); // Limpa o campo da senha
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

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
          title={loading ? "Enviando código..." : "Atualizar Senha"}
          onPress={handleChangePassword}
          disabled={loading}
        />
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Sair (Logout)" color="#e74c3c" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
