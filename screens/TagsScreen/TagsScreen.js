import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./TagsScreen.styles";
import { TAG_COLORS, colors } from "../../constants/colors";
import { useTags } from "../../hooks/useTags";
import { createTag, updateTag, deleteTag } from "../../services/tagsService";
import { getContrastTextColor, isValidHex } from "../../utils/color";
import { tagSchema } from "../../utils/validators";
import LoadingView from "../../components/LoadingView";
import EmptyState from "../../components/EmptyState";
import AppButton from "../../components/AppButton";
import ControlledFormField from "../../components/ControlledFormField";
import ColorPicker from "../../components/ColorPicker";
import ColorGradientPicker from "../../components/ColorGradientPicker";
import Toast from "../../components/Toast";

export default function TagsScreen() {
  const { user } = useAuth();
  const {
    tags,
    loading,
    refresh: fetchTags,
  } = useTags({
    orderBy: "createdAt",
    ascending: false,
  });

  // Formulário de criação
  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    setValue: setCreateValue,
    watch: watchCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", color: TAG_COLORS[0] },
  });

  const [newTagHexInput, setNewTagHexInput] = useState(TAG_COLORS[0]);
  const newTagName = watchCreate("name");
  const newTagColor = watchCreate("color");

  // Gradiente aberto ao tocar na bolinha de cor ("create" | "edit" | null)
  const [pickerTarget, setPickerTarget] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 1500);
  };

  // Modal de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [editHexInput, setEditHexInput] = useState(TAG_COLORS[0]);

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", color: TAG_COLORS[0] },
  });

  const editName = watchEdit("name");
  const editColor = watchEdit("color");

  const handleNewColorSelect = (color) => {
    setCreateValue("color", color, { shouldValidate: true });
    setNewTagHexInput(color);
  };

  const handleNewHexChange = (text) => {
    let hex = text;
    if (!hex.startsWith("#")) hex = "#" + hex;
    setNewTagHexInput(hex);
    if (isValidHex(hex)) {
      setCreateValue("color", hex, { shouldValidate: true });
    }
  };

  const handleEditColorSelect = (color) => {
    setEditValue("color", color, { shouldValidate: true });
    setEditHexInput(color);
  };

  const handleEditHexChange = (text) => {
    let hex = text;
    if (!hex.startsWith("#")) hex = "#" + hex;
    setEditHexInput(hex);
    if (isValidHex(hex)) {
      setEditValue("color", hex, { shouldValidate: true });
    }
  };

  const onCreateTag = async ({ name, color }) => {
    const { error } = await createTag(user.id, {
      name: name.trim(),
      color,
      textColor: getContrastTextColor(color),
    });

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    resetCreate({ name: "", color: TAG_COLORS[0] });
    setNewTagHexInput(TAG_COLORS[0]);
    setPickerTarget(null);
    fetchTags();
    showToast("Tag criada!");
  };

  const handleDeleteTag = (tag) => {
    Alert.alert(
      "Excluir Tag",
      `Deseja excluir a tag "${tag.name}"? As transações que usam essa tag não serão excluídas, apenas perderão a marcação.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteTag(tag.id);

            if (error) {
              Alert.alert("Erro", error.message);
            } else {
              fetchTags();
            }
          },
        },
      ],
    );
  };

  const openEditModal = (tag) => {
    setPickerTarget(null);
    setEditingTag(tag);
    resetEdit({ name: tag.name, color: tag.color || TAG_COLORS[0] });
    setEditHexInput(tag.color || TAG_COLORS[0]);
    setEditModalVisible(true);
  };

  const onUpdateTag = async ({ name, color }) => {
    const { error } = await updateTag(editingTag.id, {
      name: name.trim(),
      color,
      textColor: getContrastTextColor(color),
    });

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    setEditModalVisible(false);
    setEditingTag(null);
    setPickerTarget(null);
    fetchTags();
    showToast("Tag atualizada!");
  };

  // Preview de como a tag vai aparecer no histórico
  const renderTagPreview = (name, bgColor) => {
    const displayName = name.trim() || "Nome da tag";
    const textColor = isValidHex(bgColor)
      ? getContrastTextColor(bgColor)
      : colors.white;
    const displayBg = isValidHex(bgColor) ? bgColor : colors.borderStrong;

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview no histórico:</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewIconWrapper}>
            <Ionicons
              name="arrow-down-circle"
              size={24}
              color={colors.expense}
            />
          </View>
          <View style={styles.previewInfo}>
            <View style={styles.previewTitleRow}>
              <Text style={styles.previewTitle}>Exemplo transação</Text>
              <View
                style={[styles.previewTagBadge, { backgroundColor: displayBg }]}
              >
                <Text style={[styles.previewTagText, { color: textColor }]}>
                  {displayName}
                </Text>
              </View>
            </View>
            <Text style={styles.previewDate}>05/02/2026</Text>
          </View>
          <Text style={[styles.previewValue, { color: colors.expense }]}>
            - R$ 50,00
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Minhas Tags</Text>

        {/* Formulário de criação */}
        <View style={styles.formContainer}>
          <ControlledFormField
            control={createControl}
            name="name"
            label="Nova Tag"
            inputStyle={styles.input}
            labelStyle={styles.label}
            placeholder="Nome da tag"
            maxLength={30}
          />

          <Text style={styles.colorLabel}>Cor (toque na bolinha ou digite):</Text>
          <ColorPicker
            selectedColor={newTagColor}
            onSelect={handleNewColorSelect}
          />

          <View style={styles.hexInputRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setPickerTarget((prev) => (prev === "create" ? null : "create"))
              }
              style={[
                styles.hexPreviewDot,
                {
                  backgroundColor: isValidHex(newTagColor)
                    ? newTagColor
                    : colors.borderStrong,
                },
                pickerTarget === "create" && styles.hexPreviewDotActive,
              ]}
            />
            <TextInput
              style={styles.hexInput}
              placeholder="#2980b9"
              placeholderTextColor={colors.placeholder}
              value={newTagHexInput}
              onChangeText={handleNewHexChange}
              maxLength={7}
              autoCapitalize="none"
            />
          </View>
          {!!createErrors.color && (
            <Text style={styles.errorText}>{createErrors.color.message}</Text>
          )}

          {pickerTarget === "create" && (
            <ColorGradientPicker
              color={newTagColor}
              onSelect={handleNewColorSelect}
            />
          )}

          {/* Preview em tempo real */}
          {renderTagPreview(newTagName, newTagColor)}

          <AppButton
            title={isCreating ? "Salvando..." : "Criar Tag"}
            onPress={handleCreateSubmit(onCreateTag)}
            disabled={isCreating}
            color={colors.accent}
          />
        </View>

        {/* Lista de tags */}
        <Text style={styles.listTitle}>Tags Cadastradas</Text>

        {loading ? (
          <LoadingView />
        ) : tags.length === 0 ? (
          <EmptyState text="Nenhuma tag cadastrada ainda." />
        ) : (
          tags.map((tag) => (
            <View key={tag.id} style={styles.tagItem}>
              <View
                style={[
                  styles.tagBadgeInline,
                  { backgroundColor: tag.color || colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.tagBadgeText,
                    {
                      color:
                        tag.textColor ||
                        getContrastTextColor(tag.color || colors.accent),
                    },
                  ]}
                >
                  {tag.name}
                </Text>
              </View>
              <View style={styles.tagActions}>
                <TouchableOpacity onPress={() => openEditModal(tag)}>
                  <Ionicons name="pencil" size={20} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTag(tag)}>
                  <Ionicons name="trash" size={20} color={colors.expense} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Modal de Edição */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Editar Tag</Text>

                <ControlledFormField
                  control={editControl}
                  name="name"
                  label="Nome"
                  inputStyle={styles.input}
                  labelStyle={styles.label}
                  placeholder="Nome da tag"
                  maxLength={30}
                />

                <Text style={styles.colorLabel}>
                  Cor (toque na bolinha ou digite):
                </Text>
                <ColorPicker
                  selectedColor={editColor}
                  onSelect={handleEditColorSelect}
                />

                <View style={styles.hexInputRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setPickerTarget((prev) =>
                        prev === "edit" ? null : "edit",
                      )
                    }
                    style={[
                      styles.hexPreviewDot,
                      {
                        backgroundColor: isValidHex(editColor)
                          ? editColor
                          : colors.borderStrong,
                      },
                      pickerTarget === "edit" && styles.hexPreviewDotActive,
                    ]}
                  />
                  <TextInput
                    style={styles.hexInput}
                    placeholder="#2980b9"
                    placeholderTextColor={colors.placeholder}
                    value={editHexInput}
                    onChangeText={handleEditHexChange}
                    maxLength={7}
                    autoCapitalize="none"
                  />
                </View>
                {!!editErrors.color && (
                  <Text style={styles.errorText}>
                    {editErrors.color.message}
                  </Text>
                )}

                {pickerTarget === "edit" && (
                  <ColorGradientPicker
                    color={editColor}
                    onSelect={handleEditColorSelect}
                  />
                )}

                {/* Preview em tempo real */}
                {renderTagPreview(editName, editColor)}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setPickerTarget(null);
                      setEditModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSave]}
                    onPress={handleEditSubmit(onUpdateTag)}
                  >
                    <Text style={styles.modalButtonTextSave}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Toast visible={toast.visible} message={toast.message} />
    </View>
  );
}
