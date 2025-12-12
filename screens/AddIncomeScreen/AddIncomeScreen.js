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
import { styles } from "./AddIncomeScreen.styles";

export default function AddIncomeScreen({ navigation, route }) {
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const transactionToEdit = route.params?.transactionToEdit;

  // useFocusEffect garante que o estado seja resetado ou preenchido corretamente
  // toda vez que a tela é exibida
  useFocusEffect(
    useCallback(() => {
      if (transactionToEdit) {
        setDescription(transactionToEdit.descricao);
        setValue(String(transactionToEdit.valor));
        setDate(new Date(transactionToEdit.data_transacao));
      } else {
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
      // --- UPDATE ---
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
      // --- INSERT ---
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
    } else {
      Alert.alert(
        "Sucesso",
        transactionToEdit ? "Receita atualizada!" : "Receita registrada!"
      );

      // Limpeza de estado e navegação
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
    </View>
  );
}
