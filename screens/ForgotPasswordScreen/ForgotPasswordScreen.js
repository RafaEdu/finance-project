import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { styles } from "./ForgotPasswordScreen.styles";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetEmail() {
    if (!email) {
      Alert.alert("Erro", "Por favor, digite seu e-mail.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert(
        "Sucesso",
        "Código de recuperação enviado! Verifique seu e-mail."
      );
      // Mudança aqui: VerifyAccount
      navigation.navigate("VerifyAccount", {
        email: email,
        type: "recovery",
      });
    }

    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>
          Digite seu email para receber o código de 6 dígitos.
        </Text>

        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="email@endereco.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Enviando..." : "Enviar Código"}
            disabled={loading}
            onPress={sendResetEmail}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.link}
        >
          <Text style={styles.linkText}>Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
