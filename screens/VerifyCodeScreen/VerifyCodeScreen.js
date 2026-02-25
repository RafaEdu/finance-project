import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { styles } from "./VerifyCodeScreen.styles";

export default function VerifyCodeScreen({ route, navigation }) {
  const { email, type, newPassword } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Erro", "O código deve ter 6 dígitos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar o código OTP
      // Se type="signup", o sucesso aqui cria a sessão, e o App.js automaticamente
      // troca para a pilha Autenticada (MainTabs), saindo desta tela.
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: type,
      });

      if (error) throw error;

      // 2. Se for fluxo de 'recovery' com nova senha (vindo do Perfil logado)
      if (type === "recovery" && newPassword) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;

        Alert.alert("Sucesso", "Senha atualizada com sucesso!");
        navigation.navigate("MainTabs"); // Volta para o Dashboard manualmente pois já estávamos logados
      }
      // 3. Se for 'signup', o App.js cuidará do redirecionamento automático
      else if (type === "signup") {
        Alert.alert("Sucesso", "Conta verificada! Bem-vindo.");
      }
      // 4. Se for 'recovery' do ForgotPassword (sem senha ainda)
      else if (type === "recovery" && !newPassword) {
        // O usuário foi logado pelo token. O App.js vai jogar para o Dashboard.
        Alert.alert(
          "Sucesso",
          "Você foi logado! Vá ao seu perfil para redefinir sua senha."
        );
      }
    } catch (error) {
      Alert.alert("Erro na verificação", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificação</Text>
      <Text style={styles.subtitle}>
        Digite o código de 6 dígitos enviado para: {email}
      </Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="123456"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Verificando..." : "Confirmar Código"}
          onPress={handleVerify}
          disabled={loading}
        />
      </View>
    </View>
  );
}
