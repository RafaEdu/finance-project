import React from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordReset } from "../../services/authService";
import { styles } from "./ForgotPasswordScreen.styles";
import { ROUTES } from "../../constants/routes";
import { forgotPasswordSchema } from "../../utils/validators";
import ControlledFormField from "../../components/ControlledFormField";
import AppButton from "../../components/AppButton";

export default function ForgotPasswordScreen({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }) => {
    const { error } = await sendPasswordReset(email);

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    Alert.alert(
      "Sucesso",
      "Código de recuperação enviado! Verifique seu e-mail.",
    );
    navigation.navigate(ROUTES.verifyAccount, {
      email,
      type: "recovery",
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>
          Digite seu email para receber o código de 6 dígitos.
        </Text>

        <ControlledFormField
          control={control}
          name="email"
          inputStyle={styles.input}
          placeholder="email@endereco.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.buttonContainer}>
          <AppButton
            title={isSubmitting ? "Enviando..." : "Enviar Código"}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
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
