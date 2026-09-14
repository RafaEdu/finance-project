import React from "react";
import { View, Text, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtp, updateUser } from "../../services/authService";
import { styles } from "./VerifyCodeScreen.styles";
import { ROUTES } from "../../constants/routes";
import { verifyCodeSchema } from "../../utils/validators";
import ControlledFormField from "../../components/ControlledFormField";
import AppButton from "../../components/AppButton";

export default function VerifyCodeScreen({ route, navigation }) {
  const { email, type, newPassword } = route.params || {};

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async ({ code }) => {
    try {
      // 1. Verificar o código OTP
      // Se type="signup", o sucesso aqui cria a sessão, e o App.js automaticamente
      // troca para a pilha Autenticada (MainTabs), saindo desta tela.
      const { error } = await verifyOtp({
        email,
        token: code,
        type,
      });

      if (error) throw error;

      // 2. Se for fluxo de 'recovery' com nova senha (vindo do Perfil logado)
      if (type === "recovery" && newPassword) {
        const { error: updateError } = await updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;

        Alert.alert("Sucesso", "Senha atualizada com sucesso!");
        navigation.navigate(ROUTES.mainTabs);
      }
      // 3. Se for 'signup', o App.js cuidará do redirecionamento automático
      else if (type === "signup") {
        Alert.alert("Sucesso", "Conta verificada! Bem-vindo.");
      }
      // 4. Se for 'recovery' do ForgotPassword (sem senha ainda)
      else if (type === "recovery" && !newPassword) {
        Alert.alert(
          "Sucesso",
          "Você foi logado! Vá ao seu perfil para redefinir sua senha.",
        );
      }
    } catch (error) {
      Alert.alert("Erro na verificação", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificação</Text>
      <Text style={styles.subtitle}>
        Digite o código de 6 dígitos enviado para: {email}
      </Text>

      <ControlledFormField
        control={control}
        name="code"
        inputStyle={styles.input}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <View style={styles.buttonContainer}>
        <AppButton
          title={isSubmitting ? "Verificando..." : "Confirmar Código"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}
