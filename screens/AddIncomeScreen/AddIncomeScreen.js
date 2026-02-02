import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./AddIncomeScreen.styles";

export default function AddIncomeScreen({ navigation, route }) {
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para o Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const transactionToEdit = route.params?.transactionToEdit;

  useFocusEffect(
    useCallback(() => {
      if (transactionToEdit) {
        setDescription(transactionToEdit.descricao);
        setValue(transactionToEdit.valor.toFixed(2).replace(".", ","));
        setDate(new Date(transactionToEdit.data_transacao));
      } else {
        setDescription("");
        setValue("");
        setDate(new Date());
      }
      setShowToast(false);
    }, [transactionToEdit]),
  );

  const handleAmountChange = (text) => {
    const cleanValue = text.replace(/\D/g, "");
    if (!cleanValue) {
      setValue("");
      return;
    }
    const numberValue = Number(cleanValue) / 100;
    const formattedValue = numberValue.toFixed(2).replace(".", ",");
    setValue(formattedValue);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleSave = async () => {
    if (!description || !value) {
      Alert.alert("Erro", "Preencha a descrição e o valor.");
      return;
    }

    setLoading(true);

    const numericValue = parseFloat(value.replace(/\./g, "").replace(",", "."));

    if (isNaN(numericValue)) {
      Alert.alert("Erro", "Valor inválido.");
      setLoading(false);
      return;
    }

    let error = null;

    if (transactionToEdit) {
      const { error: updateError } = await supabase
        .from("receita")
        .update({
          descricao: description,
          valor: numericValue,
          data_transacao: date.toISOString(),
        })
        .eq("id", transactionToEdit.id);

      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("receita").insert({
        user_id: user.id,
        descricao: description,
        valor: numericValue,
        data_transacao: date.toISOString(),
        recebido: false,
      });

      error = insertError;
    }

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      setLoading(false);
    } else {
      setToastMessage(
        transactionToEdit
          ? "Receita atualizada com sucesso!"
          : "Receita registrada com sucesso!",
      );
      setShowToast(true);

      setTimeout(() => {
        setDescription("");
        setValue("");
        setDate(new Date());
        navigation.setParams({ transactionToEdit: null });
        navigation.navigate("Dashboard");
        setLoading(false);
        setShowToast(false);
      }, 1500);
    }
  };

  const handleCancelEdit = () => {
    navigation.setParams({ transactionToEdit: null });
    setDescription("");
    setValue("");
    setDate(new Date());
  };

  return (
    // KeyboardAvoidingView para empurrar a tela
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* ScrollView adicionado para permitir rolar quando o teclado aperta a tela */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>
              {transactionToEdit ? "Editar Receita" : "Nova Receita"}
            </Text>

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Salário"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={value}
              onChangeText={handleAmountChange}
            />

            <Text style={styles.label}>Data da Transação</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString("pt-BR")}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <Button
                title={
                  loading
                    ? "Salvando..."
                    : transactionToEdit
                      ? "Atualizar"
                      : "Salvar Receita"
                }
                color="#27ae60"
                onPress={handleSave}
                disabled={loading}
              />

              {transactionToEdit && (
                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Cancelar Edição"
                    color="gray"
                    onPress={handleCancelEdit}
                  />
                </View>
              )}
            </View>

            {showToast && (
              <View style={styles.toastContainer}>
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
