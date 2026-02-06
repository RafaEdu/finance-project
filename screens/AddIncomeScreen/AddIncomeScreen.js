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
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons"; // Certifique-se de ter instalado
import { styles } from "./AddIncomeScreen.styles";

// Função auxiliar para gerar UUID v4 válido (para o grupo_id)
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddIncomeScreen({ navigation, route }) {
  const { user } = useAuth();

  // Modos: 'single' (Única) ou 'recurring' (Recorrente)
  const [mode, setMode] = useState("single");

  // Campos Comuns
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  // Campos Receita Única
  const [singleValue, setSingleValue] = useState("");

  // Campos Receita Recorrente
  const [recurrenceCount, setRecurrenceCount] = useState(2); // Quantidade de meses/recebimentos
  const [baseRecurrenceValue, setBaseRecurrenceValue] = useState(""); // Valor base formatado
  const [areValuesDifferent, setAreValuesDifferent] = useState(false);
  const [recurrenceList, setRecurrenceList] = useState([]); // Lista de objetos { id, value, date }

  // Tags
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // Controles de UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false); // Modal da seleção de qtd
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const transactionToEdit = route.params?.transactionToEdit;

  // --- EFEITOS E INICIALIZAÇÃO ---

  useFocusEffect(
    useCallback(() => {
      resetForm();
      fetchTags();
      if (transactionToEdit) {
        // Edição de item existente (trata como único por segurança na edição individual)
        setMode("single");
        setDescription(transactionToEdit.descricao);
        setSingleValue(transactionToEdit.valor.toFixed(2).replace(".", ","));
        setDate(new Date(transactionToEdit.data_transacao));
        setSelectedTagId(transactionToEdit.tag_id || null);
      }
    }, [transactionToEdit]),
  );

  const fetchTags = async () => {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("nome", { ascending: true });
    setTags(data || []);
  };

  const resetForm = () => {
    setMode("single");
    setDescription("");
    setDate(new Date());
    setSingleValue("");
    setRecurrenceCount(2);
    setBaseRecurrenceValue("");
    setAreValuesDifferent(false);
    setRecurrenceList([]);
    setSelectedTagId(null);
    setShowToast(false);
  };

  // --- LÓGICA DE GERAÇÃO DA LISTA DE RECEBIMENTOS ---

  useEffect(() => {
    if (mode === "recurring") {
      generateRecurrenceList();
    }
  }, [recurrenceCount, baseRecurrenceValue, date, mode]);

  const generateRecurrenceList = () => {
    const numericBaseValue = parseCurrency(baseRecurrenceValue);
    const newList = [];

    for (let i = 0; i < recurrenceCount; i++) {
      const itemDate = new Date(date);
      itemDate.setMonth(itemDate.getMonth() + i);

      const existingItem = recurrenceList[i];
      // Se já editou um valor específico e a flag está ativa, mantém o valor editado
      const valueToUse =
        areValuesDifferent && existingItem
          ? existingItem.value
          : numericBaseValue;

      newList.push({
        id: i + 1,
        value: valueToUse,
        displayValue: formatCurrency(valueToUse),
        date: itemDate,
      });
    }
    setRecurrenceList(newList);
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

  const handleBaseRecurrenceValueChange = (text) => {
    const val = parseCurrency(text);
    setBaseRecurrenceValue(val.toFixed(2).replace(".", ","));
  };

  const handleIndividualValueChange = (text, index) => {
    const val = parseCurrency(text);
    const newList = [...recurrenceList];
    newList[index].value = val;
    newList[index].displayValue = val.toFixed(2).replace(".", ",");
    setRecurrenceList(newList);
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

    // Validações de valor
    if (mode === "single" && parseCurrency(singleValue) <= 0) {
      Alert.alert("Erro", "Insira um valor válido.");
      return;
    }
    if (
      mode === "recurring" &&
      parseCurrency(baseRecurrenceValue) <= 0 &&
      !areValuesDifferent
    ) {
      Alert.alert("Erro", "Insira um valor válido para os recebimentos.");
      return;
    }

    setLoading(true);

    try {
      let error = null;

      if (transactionToEdit) {
        // Modo Edição (apenas do item selecionado)
        const { error: updateError } = await supabase
          .from("receita")
          .update({
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
            tag_id: selectedTagId,
          })
          .eq("id", transactionToEdit.id);
        error = updateError;
      } else {
        // Modo Criação
        if (mode === "single") {
          const { error: insertError } = await supabase.from("receita").insert({
            user_id: user.id,
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
            recebido: false,
            parcela_atual: 1,
            parcela_total: 1,
            grupo_id: null,
            tag_id: selectedTagId,
          });
          error = insertError;
        } else {
          // Modo Recorrente (Bulk Insert)
          const groupId = generateUUID();
          const rowsToInsert = recurrenceList.map((item) => ({
            user_id: user.id,
            descricao: description,
            valor: item.value,
            data_transacao: item.date.toISOString(),
            recebido: false,
            parcela_atual: item.id,
            parcela_total: recurrenceCount,
            grupo_id: groupId,
            tag_id: selectedTagId,
          }));

          const { error: insertError } = await supabase
            .from("receita")
            .insert(rowsToInsert);

          error = insertError;
        }
      }

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
      } else {
        setToastMessage(
          transactionToEdit ? "Receita atualizada!" : "Receita registrada!",
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

  // Renderiza cada linha da lista de recorrência
  const renderRecurrenceItem = ({ item, index }) => (
    <View style={styles.installmentRow}>
      <Text style={styles.installmentLabel}>
        {item.id}º Recebimento - {item.date.toLocaleDateString("pt-BR")}
      </Text>
      {areValuesDifferent ? (
        <TextInput
          style={styles.installmentInput}
          value={item.displayValue}
          onChangeText={(text) => handleIndividualValueChange(text, index)}
          keyboardType="numeric"
          placeholder="0,00"
        />
      ) : (
        <Text style={styles.installmentValueFixed}>R$ {item.displayValue}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* 1. SELETOR DE MODO (ABAS) - Só aparece se não for edição */}
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
                Receita Única
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

        <Text style={styles.title}>
          {transactionToEdit
            ? "Editar Receita"
            : mode === "single"
              ? "Nova Receita"
              : "Nova Receita Recorrente"}
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Salário, Projeto X..."
            value={description}
            onChangeText={setDescription}
          />

          {/* Seletor de Tag */}
          <View style={styles.tagSelectorRow}>
            <TouchableOpacity
              style={styles.tagSelector}
              onPress={() => setShowTagPicker(true)}
            >
              {selectedTagId ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor:
                        tags.find((t) => t.id === selectedTagId)?.cor ||
                        "#2980b9",
                      marginRight: 8,
                    }}
                  />
                  <Text style={styles.tagSelectorText}>
                    {tags.find((t) => t.id === selectedTagId)?.nome || "Tag"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedTagId(null)}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="pricetag-outline" size={16} color="#999" />
                  <Text style={styles.tagSelectorPlaceholder}>
                    Adicionar tag
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tagAddButton}
              onPress={() => navigation.navigate("Tags")}
            >
              <Ionicons name="add-circle-outline" size={22} color="#27ae60" />
            </TouchableOpacity>
          </View>

          {/* FORMULÁRIO MODO ÚNICO */}
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

              <Text style={styles.label}>Data do Recebimento</Text>
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

          {/* FORMULÁRIO MODO RECORRENTE */}
          {mode === "recurring" && (
            <>
              <Text style={styles.label}>Data do 1º Recebimento</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString("pt-BR")}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Quantidade de Recebimentos</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowCountPicker(true)}
              >
                <Text style={styles.selectorText}>{recurrenceCount}x</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Valor do Recebimento (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                keyboardType="numeric"
                value={baseRecurrenceValue}
                onChangeText={handleBaseRecurrenceValueChange}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  Valores diferentes por mês?
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#27ae60" }} // Cor verde para receita
                  thumbColor={areValuesDifferent ? "#fff" : "#f4f3f4"}
                  onValueChange={setAreValuesDifferent}
                  value={areValuesDifferent}
                />
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>
                Detalhamento dos Recebimentos:
              </Text>
              <View style={styles.listContainer}>
                {recurrenceList.map((item, index) => (
                  <View key={item.id}>
                    {renderRecurrenceItem({ item, index })}
                    {index < recurrenceList.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footerContainer}>
          <Button
            title={loading ? "Salvando..." : "Salvar"}
            color="#27ae60" // Verde para receita
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

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Modal de Seleção de Quantidade */}
        <Modal
          visible={showCountPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Selecione a Qtd. de Recebimentos
              </Text>
              <FlatList
                data={Array.from({ length: 47 }, (_, i) => i + 2)}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setRecurrenceCount(item);
                      setShowCountPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}x</Text>
                  </TouchableOpacity>
                )}
              />
              <Button
                title="Fechar"
                onPress={() => setShowCountPicker(false)}
                color="#27ae60"
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Seleção de Tag */}
        <Modal visible={showTagPicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione uma Tag</Text>
              <FlatList
                data={tags}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedTagId(item.id);
                      setShowTagPicker(false);
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: item.cor || "#2980b9",
                          marginRight: 10,
                        }}
                      />
                      <Text style={styles.modalItemText}>{item.nome}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={{ textAlign: "center", color: "#999", padding: 20 }}
                  >
                    Nenhuma tag cadastrada.
                  </Text>
                }
              />
              <Button
                title="Fechar"
                onPress={() => setShowTagPicker(false)}
                color="#27ae60"
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
    </KeyboardAvoidingView>
  );
}
