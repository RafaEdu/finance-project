import React, { useState } from "react";
import { Text } from "react-native";
import { verifyOtp, sendPasswordReset } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import FormField from "../../components/FormField";
import AppButton from "../../components/AppButton";
export default function VerifyCodeScreen({ route, navigation }) {
  const { email, type } = route.params || {};
  const { verifyRecovery } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result =
        type === "recovery"
          ? await verifyRecovery(email, code)
          : await verifyOtp({ email, token: code, type });
      if (result.error) throw result.error;
    } catch {
      setError(
        "Código inválido ou expirado. Confira o e-mail e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <ScreenHeader
        title="Confira seu e-mail"
        subtitle={`Digite o código enviado para ${email || "seu e-mail"}.`}
        onBack={() => navigation.goBack()}
      />
      <FormField
        label="Código de verificação"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, ""))}
        maxLength={6}
        keyboardType="number-pad"
        autoComplete="one-time-code"
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.expense }}>
          {error}
        </Text>
      )}
      <AppButton title="Confirmar código" loading={busy} onPress={verify} />
      {type === "recovery" && (
        <AppButton
          title="Reenviar código"
          variant="neutral"
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              const result = await sendPasswordReset(email);
              setError(
                result.error
                  ? "Não foi possível reenviar. Aguarde e tente novamente."
                  : "Um novo código foi solicitado. Confira seu e-mail.",
              );
            } catch {
              setError("Não foi possível reenviar. Tente novamente.");
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </Screen>
  );
}
