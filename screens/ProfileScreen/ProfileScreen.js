import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./ProfileScreen.styles";
import { colors } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import {
  signOut,
  updateUser,
  sendPasswordReset,
} from "../../services/authService";
import { uploadAvatar } from "../../services/storageService";
import { profileNameSchema, passwordSchema } from "../../utils/validators";
import { confirmDestructive } from "../../components/ConfirmDialog";
import ControlledFormField from "../../components/ControlledFormField";
import AppButton from "../../components/AppButton";
import Toast from "../../components/Toast";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 1500);
  };

  const {
    control: nameControl,
    handleSubmit: handleNameSubmit,
    reset: resetName,
    formState: { isSubmitting: isSavingName },
  } = useForm({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: "" },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isSubmitting: isSavingPassword },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    resetName({ name: user?.user_metadata?.full_name || "" });
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user, resetName]);

  const handleLogout = () => {
    confirmDestructive({
      title: "Sair da Conta",
      message: "Tem certeza que deseja sair?",
      confirmText: "Sair",
      onConfirm: async () => {
        await signOut();
      },
    });
  };

  // Função para abrir a galeria e selecionar imagem
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à sua galeria para alterar a foto.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Erro", "Erro ao abrir galeria.");
    }
  };

  // Função para fazer o upload para o Supabase
  const uploadImage = async (uri) => {
    try {
      setUploadingImage(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { data: publicUrl, error: uploadError } = await uploadAvatar(
        user.id,
        arrayBuffer,
        { contentType: "image/png", fileExt: "png" },
      );

      if (uploadError) throw uploadError;

      const { error: updateUserError } = await updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateUserError) throw updateUserError;

      setAvatarUrl(publicUrl);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      Alert.alert(
        "Erro no Upload",
        error.message || "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmitName = async ({ name }) => {
    const { error } = await updateUser({
      data: { full_name: name.trim() },
    });
    if (error) Alert.alert("Erro", error.message);
    else showToast("Nome atualizado!");
  };

  const onSubmitPassword = async ({ password }) => {
    const { error } = await sendPasswordReset(user.email);

    if (error) {
      Alert.alert("Erro ao enviar código", error.message);
      return;
    }

    Alert.alert(
      "Verificação Enviada",
      `Um código de 6 dígitos foi enviado para ${user.email}. Digite-o na próxima tela para confirmar a nova senha.`,
      [
        {
          text: "OK, recebi o código",
          onPress: () => {
            navigation.navigate(ROUTES.verifyUpdate, {
              email: user.email,
              type: "recovery",
              newPassword: password,
            });
            resetPassword({ password: "" });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          {/* Container da Foto de Perfil */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {uploadingImage ? (
              <ActivityIndicator size="large" color={colors.white} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={60} color={colors.white} />
            )}

            {/* Ícone de edição sobreposto */}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <Text style={styles.label}>Nome de Exibição</Text>

          <ControlledFormField
            control={nameControl}
            name="name"
            inputStyle={styles.fieldInput}
            placeholder="Seu nome"
            autoCapitalize="words"
            rightAccessory={
              <TouchableOpacity style={styles.eyeIcon}>
                <Ionicons name="pencil" size={20} color="gray" />
              </TouchableOpacity>
            }
          />

          <AppButton
            title={isSavingName ? "Salvando..." : "Salvar Nome"}
            onPress={handleNameSubmit(onSubmitName)}
            disabled={isSavingName}
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.tagsButton}
            onPress={() => navigation.navigate(ROUTES.tags)}
          >
            <View style={styles.tagsButtonContent}>
              <Ionicons name="pricetag" size={20} color={colors.accent} />
              <Text style={styles.tagsButtonText}>Minhas Tags</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.placeholder}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <Text style={styles.label}>Alterar Senha</Text>

          <ControlledFormField
            control={passwordControl}
            name="password"
            inputStyle={styles.fieldInput}
            placeholder="Nova senha"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightAccessory={
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            }
          />

          <AppButton
            title={isSavingPassword ? "Enviando código..." : "Atualizar Senha"}
            onPress={handlePasswordSubmit(onSubmitPassword)}
            disabled={isSavingPassword}
          />
        </View>

        <View style={styles.logoutContainer}>
          <AppButton
            title="Sair (Logout)"
            color={colors.expense}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
      <Toast visible={toast.visible} message={toast.message} />
    </View>
  );
}
