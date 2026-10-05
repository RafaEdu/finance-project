import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { usePreferences } from "../../context/PreferencesContext";
import {
  signOut,
  updateUser,
  sendPasswordReset,
} from "../../services/authService";
import { uploadAvatar } from "../../services/storageService";
import { notify } from "../../utils/notify";
import { ROUTES } from "../../constants/routes";
import { ui } from "../../constants/theme";
import { colors } from "../../constants/colors";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import FormField from "../../components/FormField";
import AppButton from "../../components/AppButton";
import { confirmDestructive } from "../../components/ConfirmDialog";
export default function ProfileScreen({ navigation }) {
  const { user, displayName } = useAuth();
  const { visible, toggleVisibility } = usePreferences();
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [busy, setBusy] = useState(false);
  const run = async (fn, success) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (success) notify("Pronto", success);
    } catch {
      notify(
        "Não foi possível concluir",
        "Confira sua conexão e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };
  const pickAvatar = () =>
    run(async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify(
          "Permissão necessária",
          "Permita o acesso às fotos para escolher seu avatar.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();
      const contentType = asset.mimeType || "image/jpeg";
      const extension =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
            ? "webp"
            : "jpg";
      const upload = await uploadAvatar(user.id, buffer, {
        contentType,
        fileExt: extension,
      });
      if (upload.error) throw upload.error;
      const update = await updateUser({ data: { avatar_url: upload.data } });
      if (update.error) throw update.error;
    });
  return (
    <Screen>
      <ScreenHeader
        title="Meu perfil"
        subtitle="Preferências e segurança da sua conta."
      />
      <View style={[ui.card, { alignItems: "center" }]}>
        <TouchableOpacity
          onPress={pickAvatar}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {user?.user_metadata?.avatar_url ? (
            <Image
              source={{ uri: user.user_metadata.avatar_url }}
              style={{ width: 80, height: 80 }}
            />
          ) : (
            <Ionicons name="person-outline" size={32} color={colors.primary} />
          )}
        </TouchableOpacity>
        <Text style={ui.heading}>{displayName}</Text>
        <Text style={ui.muted}>{user?.email}</Text>
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Dados pessoais</Text>
        <FormField
          label="Nome de exibição"
          value={name}
          onChangeText={setName}
          placeholder="Como quer ser chamado?"
          maxLength={80}
        />
        <AppButton
          title="Salvar nome"
          loading={busy}
          onPress={() => {
            if (!name.trim()) {
              notify("Confira o nome", "Informe um nome antes de salvar.");
              return;
            }
            run(async () => {
              const { error } = await updateUser({
                data: { full_name: name.trim() },
              });
              if (error) throw error;
            }, "Nome atualizado.");
          }}
        />
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Preferências</Text>
        <View style={ui.between}>
          <Text style={[ui.muted, { flex: 1 }]}>Mostrar valores nas telas</Text>
          <Switch
            accessibilityLabel="Mostrar valores nas telas"
            value={visible}
            onValueChange={toggleVisibility}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <AppButton
          title="Gerenciar minhas tags"
          variant="neutral"
          onPress={() => navigation.navigate(ROUTES.tags)}
        />
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Segurança</Text>
        <Text style={ui.muted}>
          Confirme seu e-mail antes de definir uma nova senha.
        </Text>
        <AppButton
          title="Alterar senha"
          variant="neutral"
          disabled={busy}
          onPress={() =>
            run(async () => {
              const { error } = await sendPasswordReset(user.email);
              if (error) throw error;
              navigation.navigate(ROUTES.verifyUpdate, {
                email: user.email,
                type: "recovery",
              });
            })
          }
        />
      </View>
      <AppButton
        title="Sair da conta"
        variant="danger"
        disabled={busy}
        onPress={() =>
          confirmDestructive({
            title: "Sair da conta?",
            message: "Seus lançamentos continuarão salvos.",
            confirmText: "Sair",
            onConfirm: () =>
              run(async () => {
                const { error } = await signOut();
                if (error) throw error;
              }),
          })
        }
      />
    </Screen>
  );
}
