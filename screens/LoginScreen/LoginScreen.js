import React from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "../../services/authService";
import { styles } from "./LoginScreen.styles";
import { ROUTES } from "../../constants/routes";
import { loginSchema } from "../../utils/validators";
import ControlledFormField from "../../components/ControlledFormField";
import AppButton from "../../components/AppButton";

export default function LoginScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    const { error } = await signIn(email, password);
    if (error) Alert.alert("Erro no Login", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo de volta!</Text>

      <ControlledFormField
        control={control}
        name="email"
        inputStyle={styles.input}
        placeholder="email@endereco.com"
        autoCapitalize="none"
      />
      <ControlledFormField
        control={control}
        name="password"
        inputStyle={styles.input}
        secureTextEntry
        placeholder="Senha"
      />

      <View style={styles.buttonContainer}>
        <AppButton
          title="Entrar"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.register)}
        style={styles.link}
      >
        <Text style={styles.linkText}>Não tem conta? Registre-se</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.forgotPassword)}
        style={styles.link}
      >
        <Text style={styles.linkText}>Esqueceu a senha?</Text>
      </TouchableOpacity>
    </View>
  );
}
