import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp, sendPasswordReset } from "../services/authService";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "../utils/validators";
import { ROUTES } from "../constants/routes";
import { ui } from "../constants/theme";
import { colors } from "../constants/colors";
import Screen from "./Screen";
import ScreenHeader from "./ScreenHeader";
import ControlledFormField from "./ControlledFormField";
import AppButton from "./AppButton";
const CONFIG = {
  login: {
    title: "Seu dinheiro,\ncom clareza.",
    subtitle: "Entre para acompanhar seu mês.",
    button: "Entrar",
    schema: loginSchema,
  },
  register: {
    title: "Comece pelo essencial.",
    subtitle: "Crie sua conta e organize suas finanças.",
    button: "Criar conta",
    schema: registerSchema,
  },
  forgot: {
    title: "Recuperar acesso",
    subtitle: "Enviaremos um código para confirmar sua identidade.",
    button: "Enviar código",
    schema: forgotPasswordSchema,
  },
};
export default function AuthForm({ kind, navigation }) {
  const config = CONFIG[kind];
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: { email: "", password: "" },
  });
  const submit = async ({ email, password }) => {
    setError("");
    try {
      const result =
        kind === "login"
          ? await signIn(email, password)
          : kind === "register"
            ? await signUp(email, password)
            : await sendPasswordReset(email);
      if (result.error) throw result.error;
      if (kind === "forgot" || (kind === "register" && !result.data.session))
        navigation.navigate(ROUTES.verifyAccount, {
          email,
          type: kind === "forgot" ? "recovery" : "signup",
        });
    } catch {
      setError(
        kind === "login"
          ? "Não foi possível entrar. Confira e-mail, senha e conexão."
          : "Não foi possível concluir. Aguarde um pouco e tente novamente.",
      );
    }
  };
  return (
    <Screen contentStyle={{ paddingTop: 48, gap: 28 }}>
      <Text
        style={{
          color: colors.primary,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 3,
        }}
      >
        FINANCE
      </Text>
      <ScreenHeader
        title={config.title}
        subtitle={config.subtitle}
        onBack={kind !== "login" ? () => navigation.goBack() : undefined}
      />
      <View style={ui.card}>
        <ControlledFormField
          control={control}
          name="email"
          label="E-mail"
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        {kind !== "forgot" && (
          <ControlledFormField
            control={control}
            name="password"
            label="Senha"
            placeholder="Pelo menos 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoComplete={
              kind === "login" ? "current-password" : "new-password"
            }
          />
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.expense }}>
            {error}
          </Text>
        )}
        <AppButton
          title={config.button}
          loading={isSubmitting}
          onPress={handleSubmit(submit)}
        />
      </View>
      {kind === "login" && (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.forgotPassword)}
            style={{ minHeight: 48, justifyContent: "center" }}
            accessibilityRole="button"
          >
            <Text style={[ui.link, { textAlign: "center" }]}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
          <AppButton
            title="Criar uma conta"
            variant="neutral"
            onPress={() => navigation.navigate(ROUTES.register)}
          />
        </>
      )}
    </Screen>
  );
}
