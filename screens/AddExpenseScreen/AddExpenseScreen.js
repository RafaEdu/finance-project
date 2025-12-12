import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Platform,
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

  // Variável derivada para saber se estamos editando
  const transactionToEdit = route.params?.transactionToEdit;

  // Lógica para carregar dados ao focar na tela ou limpar se não houver parametro
  useFocusEffect(
    useCallback(() => {
      if (transactionToEdit) {
        // Se veio do Dashboard com dados, preenche o form
        setDescription(transactionToEdit.descricao);
        setValue(String(transactionToEdit.valor));
        setDate(new Date(transactionToEdit.data_transacao));
      } else {
        // Se clicou na aba ou veio sem parâmetros, limpa o form
        setDescription("");
        setValue("");
        setDate(new Date());
      }
    }, [transactionToEdit])
  );

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

    const numericValue = parseFloat(value.replace(",", "."));

    if (isNaN(numericValue)) {
      Alert.alert("Erro", "Valor inválido.");
      setLoading(false);
      return;
    }

    let error = null;

    if (transactionToEdit) {
      // --- MODO EDIÇÃO (UPDATE) ---
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
      // --- MODO CRIAÇÃO (INSERT) ---
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

      // Limpa os campos locais imediatamente
      setDescription("");
      setValue("");
      setDate(new Date());

      // Limpa o parâmetro da rota para que ao voltar não esteja mais em modo edição
      navigation.setParams({ transactionToEdit: null });

      // Vai para o dashboard
      navigation.navigate("Dashboard");
    }
    setLoading(false);
  };

  // Função para cancelar edição manual
  const handleCancelEdit = () => {
    navigation.setParams({ transactionToEdit: null });
    setDescription("");
    setValue("");
    setDate(new Date());
  };

  return (
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
        onChangeText={setValue}
      />

      <Text style={styles.label}>Data da Transação</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{date.toLocaleDateString("pt-BR")}</Text>
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
  );
}
