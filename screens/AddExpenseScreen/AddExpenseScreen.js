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
  KeyboardAvoidingView, // Importação adicionada
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

  // Tags
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [showTagPicker, setShowTagPicker] = useState(false);

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
      fetchTags();
      if (transactionToEdit) {
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
    setInstallmentsCount(2);
    setBaseInstallmentValue("");
    setAreInstallmentsDifferent(false);
    setInstallmentsList([]);
    setSelectedTagId(null);
    setShowToast(false);
  };

  // --- LÓGICA DE GERAÇÃO DA LISTA DE PARCELAS ---

  useEffect(() => {
    if (mode === "recurring") {
      generateInstallmentsList();
    }
  }, [installmentsCount, baseInstallmentValue, date, mode]);

  const generateInstallmentsList = () => {
    const numericBaseValue = parseCurrency(baseInstallmentValue);
    const newList = [];

    for (let i = 0; i < installmentsCount; i++) {
      const itemDate = new Date(date);
      itemDate.setMonth(itemDate.getMonth() + i);

      const existingItem = installmentsList[i];
      const valueToUse =
        areInstallmentsDifferent && existingItem
          ? existingItem.value
          : numericBaseValue;

      newList.push({
        id: i + 1,
        value: valueToUse,
        displayValue: formatCurrency(valueToUse),
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
        const { error: updateError } = await supabase
          .from("despesa")
          .update({
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
            tag_id: selectedTagId,
          })
          .eq("id", transactionToEdit.id);
        error = updateError;
      } else {
        if (mode === "single") {
          const { error: insertError } = await supabase.from("despesa").insert({
            user_id: user.id,
            descricao: description,
            valor: parseCurrency(singleValue),
            data_transacao: date.toISOString(),
            pago: false,
            parcela_atual: 1,
            parcela_total: 1,
            grupo_id: null,
            tag_id: selectedTagId,
          });
          error = insertError;
        } else {
          const groupId = generateUUID();
          const rowsToInsert = installmentsList.map((item) => ({
            user_id: user.id,
            descricao: description,
            valor: item.value,
            data_transacao: item.date.toISOString(),
            pago: false,
            parcela_atual: item.id,
            parcela_total: installmentsCount,
            grupo_id: groupId,
            tag_id: selectedTagId,
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
          transactionToEdit ? "Despesa atualizada!" : "Despesa registrada!",
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
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={styles.installmentValueFixed}>R$ {item.displayValue}</Text>
      )}
    </View>
  );

  return (
    // Implementação do KeyboardAvoidingView envolvendo a tela
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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

        <Text style={styles.title}>
          {transactionToEdit
            ? "Editar Despesa"
            : mode === "single"
              ? "Nova Despesa"
              : "Nova Despesa Recorrente"}
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mercado, Aluguel..."
            placeholderTextColor="#999"
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
              <Ionicons name="add-circle-outline" size={22} color="#e74c3c" />
            </TouchableOpacity>
          </View>

          {mode === "single" && (
            <>
              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor="#999"
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

          {mode === "recurring" && (
            <>
              <Text style={styles.label}>Data da 1ª Parcela</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString("pt-BR")}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Quantidade de Parcelas</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowInstallmentPicker(true)}
              >
                <Text style={styles.selectorText}>{installmentsCount}x</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Valor da Parcela (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={baseInstallmentValue}
                onChangeText={handleBaseInstallmentValueChange}
              />

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

              <Text style={[styles.label, { marginTop: 20 }]}>
                Detalhamento:
              </Text>
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

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Modal
          visible={showInstallmentPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione a Quantidade</Text>
              <FlatList
                data={Array.from({ length: 47 }, (_, i) => i + 2)}
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
    </KeyboardAvoidingView>
  );
}
