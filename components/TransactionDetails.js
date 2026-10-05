import React, { useState } from "react";
import { View, Text } from "react-native";
import Sheet from "./Sheet";
import AppButton from "./AppButton";
import MoneyText from "./MoneyText";
import { ui } from "../constants/theme";
import { getStatusLabel } from "../utils/finance";
import { formatTransactionDate } from "../utils/date";
import {
  deleteTransaction,
  updateTransaction,
} from "../services/transactionsService";
import { confirmDestructive } from "./ConfirmDialog";
import { notify } from "../utils/notify";
import { ROUTES } from "../constants/routes";
export default function TransactionDetails({
  transaction,
  onClose,
  onChanged,
  navigation,
}) {
  const [busy, setBusy] = useState(false);
  const run = async (operation) => {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await operation();
      if (error) throw error;
      onClose();
      onChanged();
    } catch {
      notify(
        "Não foi possível concluir",
        "Tente novamente. Seus dados não foram descartados.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      visible={!!transaction}
      title={transaction?.name || "Movimentação"}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {transaction && (
        <>
          <MoneyText
            value={transaction.amount}
            style={[ui.title, { fontSize: 32 }]}
          />
          <Text style={ui.muted}>
            {formatTransactionDate(transaction.date)} ·{" "}
            {getStatusLabel(transaction)}
          </Text>
          {!!transaction.description && (
            <Text style={ui.muted}>{transaction.description}</Text>
          )}
          {transaction.installmentTotal > 1 && (
            <Text style={ui.muted}>
              {transaction.entryKind === "installment"
                ? "Parcela"
                : "Ocorrência"}{" "}
              {transaction.installmentCurrent} de {transaction.installmentTotal}
              . As ações alteram somente este lançamento.
            </Text>
          )}
          <AppButton
            title={
              transaction.settled
                ? "Marcar como pendente"
                : transaction.type === "income"
                  ? "Marcar como recebido"
                  : "Marcar como pago"
            }
            loading={busy}
            onPress={() =>
              run(() =>
                updateTransaction(transaction.type, transaction.id, {
                  settled: !transaction.settled,
                }),
              )
            }
          />
          <View style={{ gap: 10 }}>
            <AppButton
              title="Editar lançamento"
              variant="neutral"
              disabled={busy}
              onPress={() => {
                onClose();
                navigation.navigate(ROUTES.transaction, {
                  transactionToEdit: transaction,
                });
              }}
            />
            <AppButton
              title="Excluir lançamento"
              variant="danger"
              disabled={busy}
              onPress={() =>
                confirmDestructive({
                  title: "Excluir lançamento?",
                  message: "Esta ação remove somente esta movimentação.",
                  onConfirm: () =>
                    run(() =>
                      deleteTransaction(transaction.type, transaction.id),
                    ),
                })
              }
            />
          </View>
        </>
      )}
    </Sheet>
  );
}
