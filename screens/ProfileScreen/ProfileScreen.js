import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Import do ImagePicker
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./ProfileScreen.styles";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estado para controlar carregamentos
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado local da imagem para preview instantâneo
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  // Função para abrir a galeria e selecionar imagem
  const pickImage = async () => {
    try {
      // Abre a galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // CORRIGIDO: De MediaTypeOptions para MediaType
        allowsEditing: true, // Permite cortar/editar
        aspect: [1, 1], // Formato quadrado
        quality: 1, // Qualidade máxima
      });

      if (!result.canceled) {
        // Se o usuário selecionou, faz o upload
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao abrir galeria.");
    }
  };

  // Função para fazer o upload para o Supabase
  const uploadImage = async (uri) => {
    try {
      setUploadingImage(true);

      // 1. Processar o arquivo para formato que o Supabase aceita (Blob/ArrayBuffer)
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // 2. Definir nome do arquivo (usamos timestamp para evitar cache)
      // Caminho: user_id/timestamp.png
      const fileExt = "png";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // 3. Upload para o bucket 'avatars'
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: "image/png",
          upsert: true, // Substitui se já existir arquivo com mesmo nome
        });

      if (uploadError) throw uploadError;

      // 4. Obter a URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // 5. Atualizar perfil do usuário com a nova URL
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateUserError) throw updateUserError;

      setAvatarUrl(publicUrl);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro no Upload",
        error.message || "Não foi possível enviar a imagem."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }
    setLoadingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Nome atualizado!");
    setLoadingName(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    setLoading(false);

    if (error) {
      Alert.alert("Erro ao enviar código", error.message);
    } else {
      Alert.alert(
        "Verificação Enviada",
        `Um código de 6 dígitos foi enviado para ${user.email}. Digite-o na próxima tela para confirmar a nova senha.`,
        [
          {
            text: "OK, recebi o código",
            onPress: () => {
              navigation.navigate("VerifyUpdate", {
                email: user.email,
                type: "recovery",
                newPassword: newPassword,
              });
              setNewPassword("");
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {/* Container da Foto de Perfil */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {uploadingImage ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Ionicons name="person" size={60} color="#fff" />
          )}

          {/* Ícone de edição sobreposto */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#2980b9", // Cor de destaque
              borderRadius: 15,
              padding: 4,
              borderWidth: 2,
              borderColor: "#fff",
            }}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <Text style={styles.label}>Nome de Exibição</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.eyeIcon}>
            <Ionicons name="pencil" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <Button
          title={loadingName ? "Salvando..." : "Salvar Nome"}
          onPress={handleUpdateName}
          disabled={loadingName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança</Text>
        <Text style={styles.label}>Alterar Senha</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nova senha"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
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
        </View>

        <Button
          title={loading ? "Enviando código..." : "Atualizar Senha"}
          onPress={handleChangePassword}
          disabled={loading}
        />
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Sair (Logout)" color="#e74c3c" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
