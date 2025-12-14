import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { styles } from "./RegisterScreen.styles";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    // Tenta cadastrar
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      // Se não houver sessão ativa imediatamente (comum quando requer confirmação),
      // enviamos para a tela de código.
      if (!data.session) {
        Alert.alert("Código Enviado", "Verifique seu e-mail.");
        navigation.navigate("VerifyCode", {
          email: email,
          type: "signup",
        });
      }
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="email@endereco.com"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder="Senha"
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Cadastrando..." : "Cadastrar"}
          disabled={loading}
          onPress={signUpWithEmail}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
        <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}
