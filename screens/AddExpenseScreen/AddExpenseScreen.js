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

  const transactionToEdit = route.params?.transactionToEdit;

  // Lógica para carregar dados ou limpar
  useFocusEffect(
    useCallback(() => {
      if (transactionToEdit) {
        setDescription(transactionToEdit.descricao);
        // Formata o valor existente para o padrão visual (ex: 10.5 -> 10,50)
        setValue(transactionToEdit.valor.toFixed(2).replace(".", ","));
        setDate(new Date(transactionToEdit.data_transacao));
      } else {
        setDescription("");
        setValue("");
        setDate(new Date());
      }
    }, [transactionToEdit])
  );

  // --- Função de Máscara de Moeda ---
  const handleAmountChange = (text) => {
    // 1. Remove tudo que não for dígito numérico
    const cleanValue = text.replace(/\D/g, "");

    // 2. Se estiver vazio, reseta
    if (!cleanValue) {
      setValue("");
      return;
    }

    // 3. Converte para número (centavos) e divide por 100
    const numberValue = Number(cleanValue) / 100;

    // 4. Formata de volta para string com vírgula e 2 casas decimais
    // Ex: 9 -> 0.09 -> "0,09"
    // Ex: 999 -> 9.99 -> "9,99"
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

    // Converte "9,99" para 9.99 (float) para salvar no banco
    const numericValue = parseFloat(value.replace(/\./g, "").replace(",", "."));

    if (isNaN(numericValue)) {
      Alert.alert("Erro", "Valor inválido.");
      setLoading(false);
      return;
    }

    let error = null;

    if (transactionToEdit) {
      // --- UPDATE ---
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
      // --- INSERT ---
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
    } else {
      Alert.alert(
        "Sucesso",
        transactionToEdit ? "Despesa atualizada!" : "Despesa registrada!"
      );

      // Limpeza
      setDescription("");
      setValue("");
      setDate(new Date());
      navigation.setParams({ transactionToEdit: null });
      navigation.navigate("Dashboard");
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    navigation.setParams({ transactionToEdit: null });
    setDescription("");
    setValue("");
    setDate(new Date());
  };

  return (
    // Envolve a tela para detectar toque fora e fechar teclado
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
          onChangeText={handleAmountChange} // Usa a nova função de máscara
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
            maximumDate={new Date()}
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
      </View>
    </TouchableWithoutFeedback>
  );
}
