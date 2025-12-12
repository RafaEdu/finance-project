import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { styles } from "./AddIncomeScreen.styles";

export default function AddIncomeScreen() {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  const handleSave = () => {
    // Lógica futura de salvar no Supabase na tabela 'receita'
    if (!description || !value) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    Alert.alert(
      "Sucesso",
      `Receita "${description}" de R$ ${value} salva! (Simulação)`
    );
    setDescription("");
    setValue("");
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: "#27ae60" }]}>Nova Receita</Text>

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

      <Button title="Salvar Receita" color="#27ae60" onPress={handleSave} />
    </View>
  );
}
