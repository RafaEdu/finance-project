import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CommonActions, usePreventRemove } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTags } from "../hooks/useTags";
import {
  createTransactions,
  updateTransaction,
} from "../services/transactionsService";
import { generateUUID } from "../utils/uuid";
import {
  parseCurrency,
  formatAmountInput,
  formatCurrency,
} from "../utils/currency";
import { addMonthsClamped, formatDateBR } from "../utils/date";
import { splitAmount } from "../utils/finance";
import { normalizeDescription } from "../utils/string";
import { ui } from "../constants/theme";
import { colors } from "../constants/colors";
import { ROUTES } from "../constants/routes";
import Screen from "./Screen";
import ScreenHeader from "./ScreenHeader";
import FormField from "./FormField";
import AppButton from "./AppButton";
import ChoiceGroup from "./ChoiceGroup";
import DateField from "./DateField";
import TagPickerModal from "./TagPickerModal";
import { confirmDestructive } from "./ConfirmDialog";

export default function TransactionForm({ navigation, route }) {
  const edit = route.params?.transactionToEdit;
  const { user } = useAuth();
  const { tags, error: tagsError, refresh: refreshTags } = useTags();
  const [type, setType] = useState(edit?.type || "expense");
  const [name, setName] = useState(edit?.name || "");
  const [description, setDescription] = useState(edit?.description || "");
  const [value, setValue] = useState(
    edit ? formatAmountInput(edit.amount) : "",
  );
  const [date, setDate] = useState(edit ? new Date(edit.date) : new Date());
  const [settled, setSettled] = useState(edit?.settled || false);
  const [tagId, setTagId] = useState(edit?.tagId || null);
  const [tagOpen, setTagOpen] = useState(false);
  const [details, setDetails] = useState(!!edit?.description);
  const [kind, setKind] = useState("single");
  const [count, setCount] = useState("2");
  const [amountMode, setAmountMode] = useState("each");
  const [different, setDifferent] = useState(false);
  const [custom, setCustom] = useState({});
  const [previewAll, setPreviewAll] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [exitAction, setExitAction] = useState(null);
  const saving = useRef(false);
  const attempt = useRef(null);
  const [initialDate] = useState(() => date.getTime());
  const dirty =
    date.getTime() !== initialDate ||
    type !== (edit?.type || "expense") ||
    count !== "2" ||
    different ||
    amountMode !== "each" ||
    name !== (edit?.name || "") ||
    value !== (edit ? formatAmountInput(edit.amount) : "") ||
    description !== (edit?.description || "") ||
    tagId !== (edit?.tagId || null) ||
    kind !== "single" ||
    settled !== (edit?.settled || false);
  usePreventRemove((dirty || locked) && !exitAction, ({ data }) => {
    if (saving.current) return;
    confirmDestructive({
      title: "Sair do lançamento?",
      message: locked
        ? "O envio não foi confirmado. Confira as movimentações antes de cadastrar novamente."
        : "O preenchimento ainda não foi salvo.",
      confirmText: "Sair",
      onConfirm: () => setExitAction(data.action),
    });
  });
  useEffect(() => {
    if (exitAction) navigation.dispatch(exitAction);
  }, [exitAction, navigation]);
  const numericCount = kind === "single" ? 1 : Number(count);
  const numericValue = parseCurrency(value);
  const schedule = useMemo(() => {
    if (
      !Number.isInteger(numericCount) ||
      numericCount < 1 ||
      numericCount > 48
    )
      return [];
    let amounts;
    try {
      amounts =
        kind === "installment" && amountMode === "total"
          ? splitAmount(numericValue, numericCount)
          : Array(numericCount).fill(numericValue);
    } catch {
      return [];
    }
    return amounts.map((amount, i) => ({
      date: addMonthsClamped(date, i),
      amount:
        different && custom[i] !== undefined
          ? parseCurrency(custom[i])
          : amount,
    }));
  }, [date, numericCount, numericValue, different, custom, kind, amountMode]);
  const total =
    schedule.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) /
    100;
  const save = async () => {
    if (saving.current) return;
    if (!attempt.current) {
      if (!name.trim()) {
        setError("Informe o nome do lançamento.");
        return;
      }
      if (
        kind !== "single" &&
        (numericCount < 2 ||
          numericCount > 48 ||
          !Number.isInteger(numericCount))
      ) {
        setError("Escolha de 2 a 48 ocorrências.");
        return;
      }
      if (
        !schedule.length ||
        schedule.some(
          (item) =>
            !Number.isFinite(item.amount) ||
            item.amount <= 0 ||
            item.amount > 999999999999.99,
        )
      ) {
        setError("Informe valores maiores que zero em todas as ocorrências.");
        return;
      }
      const groupId = kind === "single" ? null : generateUUID();
      attempt.current = schedule.map((item, index) => ({
        id: generateUUID(),
        userId: user.id,
        name: name.trim(),
        description: normalizeDescription(description),
        amount: item.amount,
        date: item.date.toISOString(),
        settled: index === 0 && settled,
        tagId,
        installmentCurrent: index + 1,
        installmentTotal: numericCount,
        groupId,
        entryKind: kind,
      }));
    }
    saving.current = true;
    setBusy(true);
    setLocked(true);
    setError("");
    try {
      const row = attempt.current[0];
      const result = edit
        ? await updateTransaction(edit.type, edit.id, {
            name: row.name,
            description: row.description,
            amount: row.amount,
            date: row.date,
            settled: row.settled,
            tagId: row.tagId,
          })
        : await createTransactions(type, attempt.current);
      if (result.error) throw result.error;
      setExitAction(CommonActions.goBack());
    } catch {
      setError(
        "Não foi possível confirmar o salvamento. Tente novamente com os mesmos dados para evitar duplicações.",
      );
      saving.current = false;
      setBusy(false);
    }
  };
  const setMoney = (text) => setValue(formatAmountInput(parseCurrency(text)));
  return (
    <Screen>
      <ScreenHeader
        title={edit ? "Editar lançamento" : "Novo lançamento"}
        subtitle={
          edit
            ? "As mudanças valem só para esta ocorrência."
            : "Registre hoje. Entenda seu mês."
        }
        onBack={() => navigation.goBack()}
      />
      {!edit && (
        <View pointerEvents={locked ? "none" : "auto"}>
          <ChoiceGroup
            value={type}
            onChange={(next) => {
              setType(next);
              setKind("single");
            }}
            options={[
              { value: "expense", label: "Despesa" },
              { value: "income", label: "Receita" },
            ]}
          />
        </View>
      )}
      <FormField
        label="Valor (R$)"
        placeholder="0,00"
        value={value}
        onChangeText={setMoney}
        editable={!locked}
        keyboardType="decimal-pad"
        inputStyle={{
          fontSize: 32,
          minHeight: 76,
          fontWeight: "600",
          letterSpacing: -0.5,
        }}
      />
      <FormField
        label="Nome"
        placeholder={type === "income" ? "Ex.: salário" : "Ex.: supermercado"}
        value={name}
        onChangeText={setName}
        editable={!locked}
        maxLength={120}
      />
      <View pointerEvents={locked ? "none" : "auto"} style={{ gap: 16 }}>
        <DateField
          value={date}
          onChange={setDate}
          label={
            settled
              ? type === "income"
                ? "Data do recebimento"
                : "Data do pagamento"
              : "Data prevista"
          }
        />
        <Text style={ui.label}>Situação</Text>
        <ChoiceGroup
          value={settled}
          onChange={setSettled}
          options={[
            {
              value: false,
              label: type === "income" ? "A receber" : "A pagar",
            },
            { value: true, label: type === "income" ? "Recebido" : "Pago" },
          ]}
        />
        <Text style={ui.label}>Tag</Text>
        <TouchableOpacity
          onPress={() => setTagOpen(true)}
          accessibilityRole="button"
          style={[ui.card, { padding: 16 }]}
        >
          <Text style={ui.muted}>
            {tags.find((tag) => tag.id === tagId)?.name ||
              "Selecionar tag (opcional)"}
          </Text>
        </TouchableOpacity>
        {tagId && (
          <AppButton
            title="Remover tag"
            variant="neutral"
            onPress={() => setTagId(null)}
          />
        )}
        {tagsError && (
          <AppButton
            title="Tentar carregar tags novamente"
            variant="neutral"
            onPress={refreshTags}
          />
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.tags)}
          accessibilityRole="button"
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text style={ui.link}>Gerenciar tags</Text>
        </TouchableOpacity>
        {!edit && (
          <>
            <Text style={ui.label}>Frequência</Text>
            <ChoiceGroup
              value={kind}
              onChange={(next) => {
                setKind(next);
                setDifferent(false);
                setCustom({});
                setAmountMode("each");
              }}
              options={[
                { value: "single", label: "Única" },
                { value: "recurring", label: "Recorrente" },
                ...(type === "expense"
                  ? [{ value: "installment", label: "Parcelada" }]
                  : []),
              ]}
            />
          </>
        )}
      </View>
      {!edit && kind !== "single" && (
        <View style={ui.card} pointerEvents={locked ? "none" : "auto"}>
          <Text style={ui.heading}>
            {kind === "installment" ? "Compra parcelada" : "Repetição mensal"}
          </Text>
          <FormField
            label="Quantidade (2 a 48)"
            value={count}
            onChangeText={(text) => setCount(text.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={2}
            editable={!locked}
          />
          {kind === "installment" && (
            <ChoiceGroup
              value={amountMode}
              onChange={(next) => {
                setAmountMode(next);
                setDifferent(false);
                setCustom({});
              }}
              options={[
                { value: "each", label: "Valor por parcela" },
                { value: "total", label: "Valor total da compra" },
              ]}
            />
          )}
          <Text style={ui.muted}>
            {kind === "installment" && amountMode === "total"
              ? "O total digitado será dividido, distribuindo os centavos sem alterar a soma."
              : "O valor digitado se repete a cada mês. A série termina após a quantidade escolhida."}
          </Text>
          {amountMode !== "total" && (
            <ChoiceGroup
              value={different}
              onChange={setDifferent}
              options={[
                { value: false, label: "Valores iguais" },
                { value: true, label: "Valores diferentes" },
              ]}
            />
          )}
          <Text style={ui.label}>Revise antes de salvar</Text>
          {(previewAll ? schedule : schedule.slice(0, 4)).map((item, index) => (
            <View key={index} style={{ gap: 8 }}>
              <Text style={ui.muted}>
                {index + 1} · {formatDateBR(item.date)}
              </Text>
              {different ? (
                <FormField
                  accessibilityLabel={`Valor da ocorrência ${index + 1}`}
                  value={custom[index] ?? formatAmountInput(item.amount)}
                  onChangeText={(text) =>
                    setCustom((old) => ({
                      ...old,
                      [index]: formatAmountInput(parseCurrency(text)),
                    }))
                  }
                  keyboardType="decimal-pad"
                  editable={!locked}
                />
              ) : (
                <Text style={ui.heading}>{formatCurrency(item.amount)}</Text>
              )}
            </View>
          ))}
          {schedule.length > 4 && (
            <AppButton
              title={previewAll ? "Mostrar menos" : "Ver todas as ocorrências"}
              variant="neutral"
              onPress={() => setPreviewAll(!previewAll)}
            />
          )}
          <Text style={ui.heading}>Total: {formatCurrency(total)}</Text>
          <Text style={ui.muted}>
            A situação escolhida vale para a primeira ocorrência. As demais
            começam pendentes.
          </Text>
        </View>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setDetails(!details)}
        style={{ minHeight: 48, justifyContent: "center" }}
      >
        <Text style={ui.link}>
          {details ? "Ocultar detalhes" : "Adicionar descrição"}
        </Text>
      </TouchableOpacity>
      {details && (
        <FormField
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!locked}
          maxLength={1000}
        />
      )}
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ color: colors.expense, fontSize: 14 }}
        >
          {error}
        </Text>
      )}
      <AppButton
        title={
          locked && !busy ? "Tentar salvar novamente" : "Salvar lançamento"
        }
        loading={busy}
        onPress={save}
      />
      <TagPickerModal
        visible={tagOpen}
        tags={tags}
        onSelect={setTagId}
        onClose={() => setTagOpen(false)}
      />
    </Screen>
  );
}
