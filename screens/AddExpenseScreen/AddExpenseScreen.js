import React, { useState, useCallback, useEffect } from "react";
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
  Switch,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./AddExpenseScreen.styles";

// Função auxiliar para gerar UUID v4 válido
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddExpenseScreen({ navigation, route }) {
  const { user } = useAuth();

  // Modos: 'single' ou 'recurring'
  const [mode, setMode] = useState("single");

  // Campos Comuns
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  // Campos Despesa Única
  const [singleValue, setSingleValue] = useState("");

  // Campos Despesa Recorrente
  const [installmentsCount, setInstallmentsCount] = useState(2); // Número (int)
  const [baseInstallmentValue, setBaseInstallmentValue] = useState(""); // String formatada
  const [areInstallmentsDifferent, setAreInstallmentsDifferent] =
    useState(false);
  const [installmentsList, setInstallmentsList] = useState([]); // Array de objetos { id, value, date }

  // Controles de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstallmentPicker, setShowInstallmentPicker] = useState(false); // Modal da "roleta"
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const transactionToEdit = route.params?.transactionToEdit;

  // --- EFEITOS E INICIALIZAÇÃO ---

  useFocusEffect(
    useCallback(() => {
      resetForm();
      if (transactionToEdit) {
        // Modo edição: simplificado para editar apenas a despesa selecionada (como única)
        // Lógica completa de editar recorrencia é complexa, mantemos edição pontual por segurança
        setMode("single");
        setDescription(transactionToEdit.descricao);
        setSingleValue(transactionToEdit.valor.toFixed(2).replace(".", ","));
        setDate(new Date(transactionToEdit.data_transacao));
      }
    }, [transactionToEdit])
  );

  const resetForm = () => {
    setMode("single");
    setDescription("");
    setDate(new Date());
    setSingleValue("");
    setInstallmentsCount(2);
    setBaseInstallmentValue("");
    setAreInstallmentsDifferent(false);
    setInstallmentsList([]);
    setShowToast(false);
  };

  // --- LÓGICA DE GERAÇÃO DA LISTA DE PARCELAS ---

  // Atualiza a lista sempre que a quantidade, o valor base ou a data inicial mudarem
  useEffect(() => {
    if (mode === "recurring") {
      generateInstallmentsList();
    }
  }, [installmentsCount, baseInstallmentValue, date, mode]);

  const generateInstallmentsList = () => {
    const numericBaseValue = parseCurrency(baseInstallmentValue);
    const newList = [];

    for (let i = 0; i < installmentsCount; i++) {
      // Calcular Data: Incrementa mês a mês
      const itemDate = new Date(date);
      itemDate.setMonth(itemDate.getMonth() + i);

      // Se já existe um item editado na posição i e a opção "diferente" está ativa, tenta manter o valor
      // Caso contrário, usa o valor base
      const existingItem = installmentsList[i];
      const valueToUse =
        areInstallmentsDifferent && existingItem
          ? existingItem.value
          : numericBaseValue;

      newList.push({
        id: i + 1, // Número da parcela
        value: valueToUse, // Valor numérico float
        displayValue: formatCurrency(valueToUse), // Valor formatado para input
        date: itemDate,
      });
    }
    setInstallmentsList(newList);
  };

  // --- HANDLERS DE INPUT ---

  const parseCurrency = (text) => {
    if (!text) return 0;
    const clean = text.replace(/\D/g, "");
    return Number(clean) / 100;
  };

  const formatCurrency = (numberVal) => {
    if (numberVal === undefined || numberVal === null) return "";
    return numberVal.toFixed(2).replace(".", ",");
  };

  const handleSingleValueChange = (text) => {
    const val = parseCurrency(text);
    setSingleValue(val.toFixed(2).replace(".", ","));
  };

  const handleBaseInstallmentValueChange = (text) => {
    const val = parseCurrency(text);
    setBaseInstallmentValue(val.toFixed(2).replace(".", ","));
    // O useEffect chamará generateInstallmentsList automaticamente
  };

  const handleIndividualInstallmentChange = (text, index) => {
    const val = parseCurrency(text);
    const newList = [...installmentsList];
    newList[index].value = val;
    newList[index].displayValue = val.toFixed(2).replace(".", ",");
    setInstallmentsList(newList);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  // --- SALVAR ---

  const handleSave = async () => {
    if (!description) {
      Alert.alert("Erro", "Preencha a descrição.");
      return;
    }

    // Validação de Valor
    if (mode === "single" && parseCurrency(singleValue) <= 0) {
      Alert.alert("Erro", "Insira um valor válido.");
      return;
    }
    if (
      mode === "recurring" &&
      parseCurrency(baseInstallmentValue) <= 0 &&
      !areInstallmentsDifferent
    ) {
      Alert.alert("Erro", "Insira um valor de parcela válido.");
      return;
    }

    setLoading(true);

    try {
      let error = null;

      if (transactionToEdit) {
        // --- EDIÇÃO (Modo Simples - Edita apenas a linha selecionada) ---
        const { error: updateError } = await supabase
          .from("despesa")
          .update({
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
          })
          .eq("id", transactionToEdit.id);
        error = updateError;
      } else {
        // --- CRIAÇÃO ---

        if (mode === "single") {
          // Inserção Única
          const { error: insertError } = await supabase.from("despesa").insert({
            user_id: user.id,
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
            pago: false,
            parcela_atual: 1,
            parcela_total: 1,
            grupo_id: null,
          });
          error = insertError;
        } else {
          // Inserção Recorrente (Batch Insert)
          // 1. Gerar UUID válido para o grupo
          const groupId = generateUUID();

          // 2. Preparar array de dados
          const rowsToInsert = installmentsList.map((item) => ({
            user_id: user.id,
            descricao: description,
            valor: item.value,
            data_transacao: item.date.toISOString(),
            pago: false,
            parcela_atual: item.id,
            parcela_total: installmentsCount,
            grupo_id: groupId,
          }));

          const { error: insertError } = await supabase
            .from("despesa")
            .insert(rowsToInsert);

          error = insertError;
        }
      }

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
      } else {
        setToastMessage(
          transactionToEdit ? "Despesa atualizada!" : "Despesa registrada!"
        );
        setShowToast(true);
        setTimeout(() => {
          navigation.setParams({ transactionToEdit: null });
          navigation.navigate("Dashboard");
          setShowToast(false);
        }, 1500);
      }
    } catch (e) {
      Alert.alert("Erro Crítico", e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADORES AUXILIARES ---

  const renderInstallmentItem = ({ item, index }) => (
    <View style={styles.installmentRow}>
      <Text style={styles.installmentLabel}>
        {item.id}ª - {item.date.toLocaleDateString("pt-BR")}
      </Text>
      {areInstallmentsDifferent ? (
        <TextInput
          style={styles.installmentInput}
          value={item.displayValue}
          onChangeText={(text) =>
            handleIndividualInstallmentChange(text, index)
          }
          keyboardType="numeric"
          placeholder="0,00"
        />
      ) : (
        <Text style={styles.installmentValueFixed}>R$ {item.displayValue}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. SELETOR DE MODO (ABAS) */}
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
              ]}
            >
              Despesa Única
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
              ]}
            >
              Recorrente
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Título dinâmico */}
      <Text style={styles.title}>
        {transactionToEdit
          ? "Editar Despesa"
          : mode === "single"
          ? "Nova Despesa"
          : "Nova Recorrência"}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Descrição (Comum a todos) */}
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mercado, Aluguel..."
          value={description}
          onChangeText={setDescription}
        />

        {/* ---------------- MODO ÚNICO ---------------- */}
        {mode === "single" && (
          <>
            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={singleValue}
              onChangeText={handleSingleValueChange}
            />

            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString("pt-BR")}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ---------------- MODO RECORRENTE ---------------- */}
        {mode === "recurring" && (
          <>
            {/* Data da 1ª Parcela */}
            <Text style={styles.label}>Data da 1ª Parcela</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString("pt-BR")}
              </Text>
            </TouchableOpacity>

            {/* Quantidade de Parcelas (Roleta/Selector) */}
            <Text style={styles.label}>Quantidade de Parcelas</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowInstallmentPicker(true)}
            >
              <Text style={styles.selectorText}>{installmentsCount}x</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {/* Valor Base */}
            <Text style={styles.label}>Valor da Parcela (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={baseInstallmentValue}
              onChangeText={handleBaseInstallmentValueChange}
            />

            {/* Toggle Valores Diferentes */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Parcelas com valores diferentes?
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#e74c3c" }}
                thumbColor={areInstallmentsDifferent ? "#fff" : "#f4f3f4"}
                onValueChange={setAreInstallmentsDifferent}
                value={areInstallmentsDifferent}
              />
            </View>

            {/* Lista Visual das Parcelas */}
            <Text style={[styles.label, { marginTop: 20 }]}>Detalhamento:</Text>
            <View style={styles.listContainer}>
              {installmentsList.map((item, index) => (
                <View key={item.id}>
                  {renderInstallmentItem({ item, index })}
                  {index < installmentsList.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* BOTÃO SALVAR (Fixo na parte inferior ou scrollavel conforme preferir, aqui deixei fora do ScrollView para fixar) */}
      <View style={styles.footerContainer}>
        <Button
          title={loading ? "Salvando..." : "Salvar"}
          color="#e74c3c"
          onPress={handleSave}
          disabled={loading}
        />
        {transactionToEdit && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10, alignItems: "center" }}
          >
            <Text style={{ color: "gray" }}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* --- COMPONENTES MODAIS / EXTRAS --- */}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Modal tipo "Roleta" para escolher parcelas (2 a 48) */}
      <Modal
        visible={showInstallmentPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione a Quantidade</Text>
            <FlatList
              data={Array.from({ length: 47 }, (_, i) => i + 2)} // Gera [2, 3, ..., 48]
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setInstallmentsCount(item);
                    setShowInstallmentPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}x</Text>
                </TouchableOpacity>
              )}
            />
            <Button
              title="Fechar"
              onPress={() => setShowInstallmentPicker(false)}
              color="#e74c3c"
            />
          </View>
        </View>
      </Modal>

      {showToast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}
