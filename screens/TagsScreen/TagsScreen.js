import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./TagsScreen.styles";

const PRESET_COLORS = [
  "#2980b9",
  "#e74c3c",
  "#27ae60",
  "#f39c12",
  "#8e44ad",
  "#1abc9c",
  "#e67e22",
  "#2c3e50",
  "#d35400",
  "#16a085",
  "#c0392b",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#f1c40f",
  "#e91e63",
  "#00bcd4",
  "#ff5722",
  "#607d8b",
];

// Calcula a luminância relativa de uma cor hex e retorna branco ou preto
function getContrastTextColor(hexColor) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Fórmula de luminância relativa (WCAG)
  const toLinear = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.4 ? "#000000" : "#ffffff";
}

function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export default function TagsScreen({ navigation }) {
  const { user } = useAuth();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Campos do formulário de criação
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newTagHexInput, setNewTagHexInput] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Modal de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);
  const [editHexInput, setEditHexInput] = useState(PRESET_COLORS[0]);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar as tags.");
    } else {
      setTags(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, []),
  );

  const handleNewColorSelect = (color) => {
    setNewTagColor(color);
    setNewTagHexInput(color);
  };

  const handleNewHexChange = (text) => {
    // Garante que começa com #
    let hex = text;
    if (!hex.startsWith("#")) hex = "#" + hex;
    setNewTagHexInput(hex);
    if (isValidHex(hex)) {
      setNewTagColor(hex);
    }
  };

  const handleEditColorSelect = (color) => {
    setEditColor(color);
    setEditHexInput(color);
  };

  const handleEditHexChange = (text) => {
    let hex = text;
    if (!hex.startsWith("#")) hex = "#" + hex;
    setEditHexInput(hex);
    if (isValidHex(hex)) {
      setEditColor(hex);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert("Erro", "O nome da tag não pode estar vazio.");
      return;
    }
    if (!isValidHex(newTagColor)) {
      Alert.alert("Erro", "Cor inválida. Use o formato #RRGGBB.");
      return;
    }

    setSaving(true);
    const corTexto = getContrastTextColor(newTagColor);
    const { error } = await supabase.from("tags").insert({
      user_id: user.id,
      nome: newTagName.trim(),
      cor: newTagColor,
      cor_texto: corTexto,
    });

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
      setNewTagHexInput(PRESET_COLORS[0]);
      fetchTags();
    }
    setSaving(false);
  };

  const handleDeleteTag = (tag) => {
    Alert.alert(
      "Excluir Tag",
      `Deseja excluir a tag "${tag.nome}"? As transações que usam essa tag não serão excluídas, apenas perderão a marcação.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("tags")
              .delete()
              .eq("id", tag.id);

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
    setEditingTag(tag);
    setEditName(tag.nome);
    setEditColor(tag.cor || PRESET_COLORS[0]);
    setEditHexInput(tag.cor || PRESET_COLORS[0]);
    setEditModalVisible(true);
  };

  const handleUpdateTag = async () => {
    if (!editName.trim()) {
      Alert.alert("Erro", "O nome da tag não pode estar vazio.");
      return;
    }
    if (!isValidHex(editColor)) {
      Alert.alert("Erro", "Cor inválida. Use o formato #RRGGBB.");
      return;
    }

    const corTexto = getContrastTextColor(editColor);
    const { error } = await supabase
      .from("tags")
      .update({ nome: editName.trim(), cor: editColor, cor_texto: corTexto })
      .eq("id", editingTag.id);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      setEditModalVisible(false);
      setEditingTag(null);
      fetchTags();
    }
  };

  // Preview de como a tag vai aparecer no histórico
  const renderTagPreview = (name, bgColor) => {
    const displayName = name.trim() || "Nome da tag";
    const textColor = isValidHex(bgColor)
      ? getContrastTextColor(bgColor)
      : "#ffffff";
    const displayBg = isValidHex(bgColor) ? bgColor : "#cccccc";

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview no histórico:</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewIconWrapper}>
            <Ionicons name="arrow-down-circle" size={24} color="#e74c3c" />
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
          <Text style={[styles.previewValue, { color: "#e74c3c" }]}>
            - R$ 50,00
          </Text>
        </View>
      </View>
    );
  };

  const renderColorPicker = (selectedColor, onSelect) => (
    <View style={styles.colorRow}>
      {PRESET_COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.colorOptionSelected,
          ]}
          onPress={() => onSelect(color)}
        >
          {selectedColor === color && (
            <Ionicons name="checkmark" size={18} color={getContrastTextColor(color)} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Minhas Tags</Text>

      {/* Formulário de criação */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nova Tag</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da tag"
          placeholderTextColor="#999"
          value={newTagName}
          onChangeText={setNewTagName}
          maxLength={30}
        />

        <Text style={styles.colorLabel}>Cor (selecione ou digite):</Text>
        {renderColorPicker(newTagColor, handleNewColorSelect)}

        <View style={styles.hexInputRow}>
          <View
            style={[
              styles.hexPreviewDot,
              {
                backgroundColor: isValidHex(newTagColor)
                  ? newTagColor
                  : "#cccccc",
              },
            ]}
          />
          <TextInput
            style={styles.hexInput}
            placeholder="#2980b9"
            placeholderTextColor="#999"
            value={newTagHexInput}
            onChangeText={handleNewHexChange}
            maxLength={7}
            autoCapitalize="none"
          />
        </View>

        {/* Preview em tempo real */}
        {renderTagPreview(newTagName, newTagColor)}

        <Button
          title={saving ? "Salvando..." : "Criar Tag"}
          onPress={handleCreateTag}
          disabled={saving}
          color="#2980b9"
        />
      </View>

      {/* Lista de tags */}
      <Text style={styles.listTitle}>Tags Cadastradas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2980b9" />
      ) : tags.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma tag cadastrada ainda.</Text>
      ) : (
        tags.map((tag) => (
          <View key={tag.id} style={styles.tagItem}>
            <View
              style={[
                styles.tagBadgeInline,
                { backgroundColor: tag.cor || "#2980b9" },
              ]}
            >
              <Text
                style={{
                  color: tag.cor_texto || getContrastTextColor(tag.cor || "#2980b9"),
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                {tag.nome}
              </Text>
            </View>
            <View style={styles.tagActions}>
              <TouchableOpacity onPress={() => openEditModal(tag)}>
                <Ionicons name="pencil" size={20} color="#2980b9" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTag(tag)}>
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal de Edição */}
      <Modal visible={editModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Tag</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor="#999"
              maxLength={30}
            />

            <Text style={styles.colorLabel}>Cor (selecione ou digite):</Text>
            {renderColorPicker(editColor, handleEditColorSelect)}

            <View style={styles.hexInputRow}>
              <View
                style={[
                  styles.hexPreviewDot,
                  {
                    backgroundColor: isValidHex(editColor)
                      ? editColor
                      : "#cccccc",
                  },
                ]}
              />
              <TextInput
                style={styles.hexInput}
                placeholder="#2980b9"
                placeholderTextColor="#999"
                value={editHexInput}
                onChangeText={handleEditHexChange}
                maxLength={7}
                autoCapitalize="none"
              />
            </View>

            {/* Preview em tempo real */}
            {renderTagPreview(editName, editColor)}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateTag}
              >
                <Text style={styles.modalButtonTextSave}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
