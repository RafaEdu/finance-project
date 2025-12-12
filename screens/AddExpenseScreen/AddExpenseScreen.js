import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { styles } from "./AddExpenseScreen.styles";

export default function AddExpenseScreen() {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  const handleSave = () => {
    // Lógica futura de salvar no Supabase na tabela 'despesa'
    if (!description || !value) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    Alert.alert(
      "Sucesso",
      `Despesa "${description}" de R$ ${value} salva! (Simulação)`
    );
    setDescription("");
    setValue("");
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: "#e74c3c" }]}>Nova Despesa</Text>

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

      <Button title="Salvar Despesa" color="#e74c3c" onPress={handleSave} />
    </View>
  );
}
