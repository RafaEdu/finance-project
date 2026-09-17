import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
  Switch,
  ScrollView,
  FlatList,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { colors } from "../constants/colors";
import { TRANSACTION_CONFIG } from "../constants/transactions";
import { parseCurrency, formatAmountInput } from "../utils/currency";
import { formatDateBR } from "../utils/date";
import { normalizeDescription } from "../utils/string";
import { generateUUID } from "../utils/uuid";
import { createTransactionSchema } from "../utils/validators";
import { useTags } from "../hooks/useTags";
import {
  createTransaction,
  createTransactions,
  updateTransaction,
} from "../services/transactionsService";
import { styles } from "./TransactionForm.styles";
import AppButton from "./AppButton";
import ControlledFormField from "./ControlledFormField";
import Toast from "./Toast";
import TagSelector from "./TagSelector";
import TagPickerModal from "./TagPickerModal";

const COUNT_OPTIONS = Array.from({ length: 47 }, (_, i) => i + 2);

// Formulário compartilhado de receita/despesa. As diferenças ficam em
// constants/transactions.js; aqui reside a lógica única dos dois cadastros.
export default function TransactionForm({ type, navigation, route }) {
  const config = TRANSACTION_CONFIG[type];
  const { user } = useAuth();

  // Modos: 'single' (único) ou 'recurring' (recorrente/parcelado)
  const [mode, setMode] = useState("single");

  // Datas e parcelas
  const [date, setDate] = useState(new Date());
  const [count, setCount] = useState(2);
  const [areValuesDifferent, setAreValuesDifferent] = useState(false);
  const [items, setItems] = useState([]);

  // Tags
  const { tags } = useTags();
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // Controles de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const transactionToEdit = route.params?.transactionToEdit;

  const schema = useMemo(
    () =>
      createTransactionSchema({
        mode,
        areValuesDifferent,
        invalidValueMessage: config.invalidValueMessage,
        invalidRecurringValueMessage: config.invalidRecurringValueMessage,
      }),
    [mode, areValuesDifferent, config],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      singleValue: "",
      baseValue: "",
    },
    mode: "onTouched",
  });

  const baseValue = watch("baseValue");

  // --- EFEITOS E INICIALIZAÇÃO ---

  useFocusEffect(
    useCallback(() => {
      if (transactionToEdit) {
        setMode("single");
        reset({
          name: transactionToEdit.name || "",
          description: transactionToEdit.description || "",
          singleValue: formatAmountInput(transactionToEdit.amount),
          baseValue: "",
        });
        setDate(new Date(transactionToEdit.date));
        setSelectedTagId(transactionToEdit.tagId || null);
      } else {
        setMode("single");
        reset({ name: "", description: "", singleValue: "", baseValue: "" });
        setDate(new Date());
        setCount(2);
        setAreValuesDifferent(false);
        setItems([]);
        setSelectedTagId(null);
        setShowToast(false);
      }
    }, [transactionToEdit, reset]),
  );

  const generateItems = () => {
    const numericBaseValue = parseCurrency(baseValue);
    const newList = [];

    for (let i = 0; i < count; i++) {
      const itemDate = new Date(date);
      itemDate.setMonth(itemDate.getMonth() + i);

      const existingItem = items[i];
      const valueToUse =
        areValuesDifferent && existingItem
          ? existingItem.value
          : numericBaseValue;

      newList.push({
        id: i + 1,
        value: valueToUse,
        displayValue: formatAmountInput(valueToUse),
        date: itemDate,
      });
    }
    setItems(newList);
  };

  useEffect(() => {
    if (mode === "recurring") {
      generateItems();
    }
  }, [count, baseValue, date, mode]);

  // --- HANDLERS DE INPUT ---

  const handleIndividualValueChange = (text, index) => {
    const val = parseCurrency(text);
    const newList = [...items];
    newList[index].value = val;
    newList[index].displayValue = formatAmountInput(val);
    setItems(newList);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  // --- SALVAR ---

  const onSubmit = async ({ name, description, singleValue }) => {
    try {
      let error = null;

      if (transactionToEdit) {
        const { error: updateError } = await updateTransaction(
          type,
          transactionToEdit.id,
          {
            name: name.trim(),
            description: normalizeDescription(description),
            amount: parseCurrency(singleValue),
            date: date.toISOString(),
            tagId: selectedTagId,
          },
        );
        error = updateError;
      } else if (mode === "single") {
        const { error: insertError } = await createTransaction(type, {
          userId: user.id,
          name: name.trim(),
          description: normalizeDescription(description),
          amount: parseCurrency(singleValue),
          date: date.toISOString(),
          settled: false,
          installmentCurrent: 1,
          installmentTotal: 1,
          groupId: null,
          tagId: selectedTagId,
        });
        error = insertError;
      } else {
        const groupId = generateUUID();
        const rowsToInsert = items.map((item) => ({
          userId: user.id,
          name: name.trim(),
          description: normalizeDescription(description),
          amount: item.value,
          date: item.date.toISOString(),
          settled: false,
          installmentCurrent: item.id,
          installmentTotal: count,
          groupId,
          tagId: selectedTagId,
        }));

        const { error: insertError } = await createTransactions(
          type,
          rowsToInsert,
        );
        error = insertError;
      }

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
      } else {
        setToastMessage(
          transactionToEdit ? config.updatedMessage : config.registeredMessage,
        );
        setShowToast(true);
        setTimeout(() => {
          navigation.setParams({ transactionToEdit: null });
          navigation.navigate(ROUTES.dashboard);
          setShowToast(false);
        }, 1500);
      }
    } catch (e) {
      Alert.alert("Erro Crítico", e.message);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.installmentRow}>
      <Text style={styles.installmentLabel}>
        {config.formatItemLabel(item.id, formatDateBR(item.date))}
      </Text>
      {areValuesDifferent ? (
        <TextInput
          style={styles.installmentInput}
          value={item.displayValue}
          onChangeText={(text) => handleIndividualValueChange(text, index)}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor={colors.placeholder}
        />
      ) : (
        <Text style={styles.installmentValueFixed}>R$ {item.displayValue}</Text>
      )}
    </View>
  );

  const title = transactionToEdit
    ? config.editTitle
    : mode === "single"
      ? config.newSingleTitle
      : config.newRecurringTitle;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex1}
    >
      <View style={styles.container}>
        {!transactionToEdit && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                mode === "single" && styles.tabButtonActive,
              ]}
              onPress={() => setMode("single")}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "single" && styles.tabTextActive,
                  mode === "single" && { color: config.color },
                ]}
              >
                {config.singleTabLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                mode === "recurring" && styles.tabButtonActive,
              ]}
              onPress={() => setMode("recurring")}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "recurring" && styles.tabTextActive,
                  mode === "recurring" && { color: config.color },
                ]}
              >
                {config.recurringTabLabel}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.title, { color: config.color }]}>{title}</Text>

        <ScrollView contentContainerStyle={styles.listPadding}>
          <ControlledFormField
            control={control}
            name="name"
            label="Nome"
            inputStyle={styles.input}
            labelStyle={styles.label}
            placeholder={config.namePlaceholder}
          />

          <ControlledFormField
            control={control}
            name="description"
            label="Descrição"
            inputStyle={styles.input}
            labelStyle={styles.label}
            placeholder="Detalhes adicionais..."
          />

          <TagSelector
            tags={tags}
            selectedTagId={selectedTagId}
            onPress={() => setShowTagPicker(true)}
            onClear={() => setSelectedTagId(null)}
            onAdd={() => navigation.navigate(ROUTES.tags)}
            accentColor={config.color}
          />

          {mode === "single" && (
            <>
              <ControlledFormField
                control={control}
                name="singleValue"
                label={config.singleValueLabel}
                inputStyle={styles.input}
                labelStyle={styles.label}
                placeholder="0,00"
                keyboardType="numeric"
                transformValue={(text) =>
                  formatAmountInput(parseCurrency(text))
                }
              />

              <Text style={styles.label}>{config.singleDateLabel}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDateBR(date)}</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "recurring" && (
            <>
              <Text style={styles.label}>{config.recurringDateLabel}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDateBR(date)}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>{config.countLabel}</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowCountPicker(true)}
              >
                <Text style={styles.selectorText}>{count}x</Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <ControlledFormField
                control={control}
                name="baseValue"
                label={config.recurringValueLabel}
                inputStyle={styles.input}
                labelStyle={styles.label}
                placeholder="0,00"
                keyboardType="numeric"
                transformValue={(text) =>
                  formatAmountInput(parseCurrency(text))
                }
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>{config.switchLabel}</Text>
                <Switch
                  trackColor={{
                    false: colors.switchTrackOff,
                    true: config.color,
                  }}
                  thumbColor={
                    areValuesDifferent ? colors.white : colors.switchThumbOff
                  }
                  onValueChange={setAreValuesDifferent}
                  value={areValuesDifferent}
                />
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>
                {config.detailLabel}
              </Text>
              <View style={styles.listContainer}>
                {items.map((item, index) => (
                  <View key={item.id}>
                    {renderItem({ item, index })}
                    {index < items.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.footerContainer}>
            <AppButton
              title={isSubmitting ? "Salvando..." : "Salvar"}
              color={config.color}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            />
            {transactionToEdit && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Modal
          visible={showCountPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{config.countModalTitle}</Text>
              <FlatList
                data={COUNT_OPTIONS}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCount(item);
                      setShowCountPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}x</Text>
                  </TouchableOpacity>
                )}
              />
              <AppButton
                title="Fechar"
                onPress={() => setShowCountPicker(false)}
                color={config.color}
              />
            </View>
          </View>
        </Modal>

        <TagPickerModal
          visible={showTagPicker}
          tags={tags}
          onSelect={setSelectedTagId}
          onClose={() => setShowTagPicker(false)}
          accentColor={config.color}
        />

        <Toast visible={showToast} message={toastMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}
