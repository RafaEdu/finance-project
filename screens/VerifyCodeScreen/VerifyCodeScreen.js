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
import { styles } from "./VerifyCodeScreen.styles";

export default function VerifyCodeScreen({ route, navigation }) {
  const { email, type, newPassword } = route.params; // Recebe dados da tela anterior
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: type, // 'signup' ou 'recovery'
      });

      if (error) throw error;

      // 2. Se for fluxo de 'recovery' (Troca de senha do perfil), atualizamos a senha agora
      if (type === "recovery" && newPassword) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;

        Alert.alert("Sucesso", "Senha atualizada com sucesso!");
        navigation.navigate("MainTabs"); // Volta para o Dashboard
      }
      // 3. Se for 'signup', o AuthContext detectará a sessão automaticamente
      else if (type === "signup") {
        Alert.alert("Sucesso", "Conta verificada! Bem-vindo.");
        // Não precisa navegar manualmente se o AuthContext estiver ouvindo o estado
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
