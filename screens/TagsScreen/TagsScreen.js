import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTags } from "../../hooks/useTags";
import { createTag, updateTag, deleteTag } from "../../services/tagsService";
import { getContrastTextColor } from "../../utils/color";
import { tagSchema } from "../../utils/validators";
import { notify } from "../../utils/notify";
import { ui } from "../../constants/theme";
import { colors, TAG_COLORS } from "../../constants/colors";
import Screen from "../../components/Screen";
import ScreenHeader from "../../components/ScreenHeader";
import Sheet from "../../components/Sheet";
import FormField from "../../components/FormField";
import AppButton from "../../components/AppButton";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import ErrorState from "../../components/ErrorState";
import { confirmDestructive } from "../../components/ConfirmDialog";
export default function TagsScreen({ navigation }) {
  const { user } = useAuth();
  const { tags, loading, error, refresh } = useTags();
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const save = async () => {
    if (saving.current) return;
    const validated = tagSchema.safeParse(form);
    if (!validated.success) {
      setFormError(validated.error.issues[0].message);
      return;
    }
    saving.current = true;
    setBusy(true);
    setFormError("");
    try {
      const value = {
        ...validated.data,
        textColor: getContrastTextColor(form.color),
      };
      const result = form.id
        ? await updateTag(form.id, value)
        : await createTag(user.id, value);
      if (result.error) throw result.error;
      setForm(null);
      refresh();
    } catch {
      setFormError("Não foi possível salvar a tag. Tente novamente.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const remove = (tag) =>
    confirmDestructive({
      title: "Excluir tag?",
      message: `A tag ${tag.name} será removida. Os lançamentos serão preservados.`,
      onConfirm: async () => {
        try {
          const result = await deleteTag(tag.id);
          if (result.error) throw result.error;
          refresh();
        } catch {
          notify("Não foi possível excluir", "Tente novamente.");
        }
      },
    });
  return (
    <Screen>
      <ScreenHeader
        title="Minhas tags"
        subtitle="Organize lançamentos do seu jeito."
        onBack={() => navigation.goBack()}
      />
      <AppButton
        title="Criar tag"
        onPress={() => {
          setFormError("");
          setForm({ name: "", color: colors.primary });
        }}
      />
      {error ? (
        <ErrorState onRetry={refresh} />
      ) : loading ? (
        <LoadingView />
      ) : !tags.length ? (
        <EmptyState text="Crie tags como Casa, Trabalho e Alimentação para organizar seus lançamentos." />
      ) : (
        tags.map((tag) => (
          <View key={tag.id} style={[ui.card, ui.between, { padding: 12 }]}>
            <View style={[ui.row, { flex: 1 }]}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: tag.color,
                }}
              />
              <Text style={[ui.heading, { flexShrink: 1 }]}>{tag.name}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Editar tag ${tag.name}`}
              onPress={() => {
                setFormError("");
                setForm(tag);
              }}
              style={ui.iconButton}
            >
              <Ionicons
                name="pencil-outline"
                size={21}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Excluir tag ${tag.name}`}
              onPress={() => remove(tag)}
              style={ui.iconButton}
            >
              <Ionicons name="trash-outline" size={21} color={colors.expense} />
            </TouchableOpacity>
          </View>
        ))
      )}
      <Sheet
        visible={!!form}
        title={form?.id ? "Editar tag" : "Nova tag"}
        onClose={() => {
          if (!busy) setForm(null);
        }}
      >
        {form && (
          <>
            <FormField
              label="Nome da tag"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
              maxLength={30}
              editable={!busy}
            />
            <Text style={ui.label}>Cor</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {TAG_COLORS.map((color) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Cor ${color}`}
                  accessibilityState={{
                    selected: form.color.toLowerCase() === color.toLowerCase(),
                  }}
                  key={color}
                  onPress={() => setForm({ ...form, color })}
                  disabled={busy}
                  style={{
                    width: 48,
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: color,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {form.color.toLowerCase() === color.toLowerCase() && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={getContrastTextColor(color)}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <FormField
              label="Cor personalizada (#RRGGBB)"
              value={form.color}
              onChangeText={(color) => setForm({ ...form, color })}
              maxLength={7}
              autoCapitalize="characters"
              editable={!busy}
            />
            {!!formError && (
              <Text accessibilityRole="alert" style={{ color: colors.expense }}>
                {formError}
              </Text>
            )}
            <AppButton title="Salvar tag" onPress={save} loading={busy} />
          </>
        )}
      </Sheet>
    </Screen>
  );
}
