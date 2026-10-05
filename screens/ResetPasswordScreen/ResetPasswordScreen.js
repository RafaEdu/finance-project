import React, { useState } from "react";
import { Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../services/authService";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import FormField from "../../components/FormField";
import AppButton from "../../components/AppButton";
import { colors } from "../../constants/colors";
export default function ResetPasswordScreen() {
  const { finishRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (password.length < 6) {
      setError("Use pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error } = await finishRecovery(password);
      if (error) throw error;
    } catch {
      setError("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <ScreenHeader
        title="Crie uma nova senha"
        subtitle="Seu código foi confirmado. Conclua a recuperação para continuar."
      />
      <FormField
        label="Nova senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <FormField
        label="Confirmar nova senha"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.expense }}>
          {error}
        </Text>
      )}
      <AppButton title="Salvar nova senha" loading={busy} onPress={save} />
      <AppButton
        title="Sair da recuperação"
        variant="neutral"
        disabled={busy}
        onPress={signOut}
      />
    </Screen>
  );
}
