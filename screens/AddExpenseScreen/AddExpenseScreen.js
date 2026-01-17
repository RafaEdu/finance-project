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
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./AddExpenseScreen.styles";

export default function AddExpenseScreen({ navigation, route }) {
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para o Toast (Pop-up de confirmação)
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
      // Garante que o toast esteja oculto ao entrar na tela
      setShowToast(false);
    }, [transactionToEdit])
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
        .from("despesa")
        .update({
          descricao: description,
          valor: numericValue,
          data_transacao: date.toISOString(),
        })
        .eq("id", transactionToEdit.id);

      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("despesa").insert({
        user_id: user.id,
        descricao: description,
        valor: numericValue,
        data_transacao: date.toISOString(),
        pago: false,
      });

      error = insertError;
    }

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      setLoading(false);
    } else {
      // --- Lógica do Toast em vez de Alert ---
      setToastMessage(
        transactionToEdit
          ? "Despesa atualizada com sucesso!"
          : "Despesa registrada com sucesso!"
      );
      setShowToast(true);

      // Aguarda 1.5 segundos para o usuário ler a mensagem antes de sair
      setTimeout(() => {
        setDescription("");
        setValue("");
        setDate(new Date());
        navigation.setParams({ transactionToEdit: null });
        navigation.navigate("Dashboard");
        setLoading(false); // Libera o loading apenas ao sair
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {transactionToEdit ? "Editar Despesa" : "Nova Despesa"}
        </Text>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supermercado"
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
                : "Salvar Despesa"
            }
            color="#e74c3c"
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

        {/* --- Componente Toast Personalizado --- */}
        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
