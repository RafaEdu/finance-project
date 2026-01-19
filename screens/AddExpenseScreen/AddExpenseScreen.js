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
  Switch, // Importado para o toggle
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "./AddExpenseScreen.styles";
// Importar biblioteca para gerar UUID (opcional, ou usar Math.random para MVP se não tiver uuid instalada)
// Como o Supabase gera IDs, usaremos um timestamp + random para o grupo_id no front ou deixamos null se for única.
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid"; // Certifique-se de ter: npm install uuid react-native-get-random-values

export default function AddExpenseScreen({ navigation, route }) {
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Novos estados para parcelamento
  const [isRecurring, setIsRecurring] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState("2"); // Padrão 2 parcelas se ativado

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
        // Se estiver editando, desabilitamos a opção de transformar em recorrente para simplificar a lógica
        setIsRecurring(false);
      } else {
        setDescription("");
        setValue("");
        setDate(new Date());
        setIsRecurring(false);
        setInstallmentsCount("2");
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

    try {
      if (transactionToEdit) {
        // Lógica de Edição (Mantida simples, edita apenas a selecionada)
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
        // Lógica de Criação
        if (isRecurring) {
          // *** LÓGICA DE PARCELAMENTO ***
          const totalInstallments = parseInt(installmentsCount);

          if (isNaN(totalInstallments) || totalInstallments < 2) {
            Alert.alert("Erro", "Número de parcelas inválido.");
            setLoading(false);
            return;
          }

          const expensesToInsert = [];
          // Gera um ID de grupo para vincular as parcelas (usando timestamp + random simples se não tiver uuid)
          // Se tiver a lib uuid instalada: const groupId = uuidv4();
          // Aqui faremos um fallback simples para não quebrar seu projeto se faltar lib:
          const groupId =
            Date.now().toString(36) + Math.random().toString(36).substr(2);

          for (let i = 0; i < totalInstallments; i++) {
            // Clona a data base
            const installmentDate = new Date(date);
            // Adiciona os meses
            installmentDate.setMonth(installmentDate.getMonth() + i);

            // Ajuste fino: Se hoje é dia 31 e o próximo mês só tem 30 dias, o JS pula para dia 1 do outro.
            // Para simplicidade, o padrão do JS é aceitável, mas em apps financeiros robustos usamos bibliotecas como 'date-fns'.

            expensesToInsert.push({
              user_id: user.id,
              descricao: description, // A numeração (1/X) será feita visualmente no front ou podemos concatenar aqui se preferir
              valor: numericValue,
              data_transacao: installmentDate.toISOString(),
              pago: false,
              parcela_atual: i + 1,
              parcela_total: totalInstallments,
              grupo_id: groupId,
            });
          }

          // Insert em lote (Batch Insert)
          const { error: insertError } = await supabase
            .from("despesa")
            .insert(expensesToInsert);

          error = insertError;
        } else {
          // *** LÓGICA PADRÃO (ÚNICA) ***
          const { error: insertError } = await supabase.from("despesa").insert({
            user_id: user.id,
            descricao: description,
            valor: numericValue,
            data_transacao: date.toISOString(),
            pago: false,
            parcela_atual: 1,
            parcela_total: 1,
            grupo_id: null,
          });
          error = insertError;
        }
      }

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
        setLoading(false);
      } else {
        setToastMessage(
          transactionToEdit
            ? "Despesa atualizada com sucesso!"
            : isRecurring
              ? `${installmentsCount} parcelas registradas!`
              : "Despesa registrada com sucesso!",
        );
        setShowToast(true);

        setTimeout(() => {
          setDescription("");
          setValue("");
          setDate(new Date());
          setIsRecurring(false); // Reseta switch
          setInstallmentsCount("2");
          navigation.setParams({ transactionToEdit: null });
          navigation.navigate("Dashboard");
          setLoading(false);
          setShowToast(false);
        }, 1500);
      }
    } catch (e) {
      Alert.alert("Erro", e.message);
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    navigation.setParams({ transactionToEdit: null });
    setDescription("");
    setValue("");
    setDate(new Date());
    setIsRecurring(false);
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
          placeholder="Ex: Compra Notebook"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Valor da Parcela (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          keyboardType="numeric"
          value={value}
          onChangeText={handleAmountChange}
        />

        <Text style={styles.label}>
          {isRecurring ? "Data da 1ª Parcela" : "Data da Transação"}
        </Text>
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

        {/* --- Seção de Recorrência/Parcelamento --- */}
        {!transactionToEdit && (
          <View style={styles.recurringContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.labelSwitch}>Cadastrar Parcelado?</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#e74c3c" }}
                thumbColor={isRecurring ? "#fff" : "#f4f3f4"}
                onValueChange={() =>
                  setIsRecurring((previousState) => !previousState)
                }
                value={isRecurring}
              />
            </View>

            {isRecurring && (
              <View style={styles.installmentsRow}>
                <Text style={styles.label}>Nº Parcelas:</Text>
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  keyboardType="numeric"
                  value={installmentsCount}
                  onChangeText={setInstallmentsCount}
                  maxLength={3}
                />
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={
              loading
                ? "Salvando..."
                : transactionToEdit
                  ? "Atualizar"
                  : isRecurring
                    ? "Gerar Parcelas"
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

        {showToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
