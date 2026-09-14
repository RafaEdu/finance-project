import React from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "../../services/authService";
import { styles } from "./RegisterScreen.styles";
import { ROUTES } from "../../constants/routes";
import { registerSchema } from "../../utils/validators";
import ControlledFormField from "../../components/ControlledFormField";
import AppButton from "../../components/AppButton";

export default function RegisterScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    const { data, error } = await signUp(email, password);

    if (error) {
      Alert.alert("Erro", error.message);
    } else if (!data.session) {
      Alert.alert("Código Enviado", "Verifique seu e-mail.");
      navigation.navigate(ROUTES.verifyAccount, {
        email,
        type: "signup",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>

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
          title={isSubmitting ? "Cadastrando..." : "Cadastrar"}
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
        <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}
