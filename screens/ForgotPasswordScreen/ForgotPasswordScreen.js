import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { styles } from "./ForgotPasswordScreen.styles";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetEmail() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "exp://localhost:19000/--/reset-password", // Ajuste conforme necessário para deep linking
    });

    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Email de recuperação enviado!");

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.subtitle}>
        Digite seu email para receber o link de redefinição.
      </Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="email@endereco.com"
        autoCapitalize="none"
      />

      <Button
        title="Enviar Email"
        disabled={loading}
        onPress={sendResetEmail}
      />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
        <Text style={styles.linkText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}
