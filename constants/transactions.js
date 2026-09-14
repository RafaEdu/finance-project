import { colors } from "./colors";

export const TRANSACTION_TYPES = {
  income: "income",
  expense: "expense",
};

// Textos e cores que diferem entre cadastro de receita e de despesa.
// O formulário (components/TransactionForm.js) consome esta configuração.
export const TRANSACTION_CONFIG = {
  [TRANSACTION_TYPES.income]: {
    type: TRANSACTION_TYPES.income,
    color: colors.income,
    namePlaceholder: "Ex: Salário, Projeto X...",
    singleTabLabel: "Receita Única",
    recurringTabLabel: "Recorrente",
    newSingleTitle: "Nova Receita",
    newRecurringTitle: "Nova Receita Recorrente",
    editTitle: "Editar Receita",
    singleValueLabel: "Valor (R$)",
    singleDateLabel: "Data do Recebimento",
    recurringDateLabel: "Data do 1º Recebimento",
    countLabel: "Quantidade de Recebimentos",
    countModalTitle: "Selecione a Qtd. de Recebimentos",
    recurringValueLabel: "Valor do Recebimento (R$)",
    switchLabel: "Valores diferentes por mês?",
    detailLabel: "Detalhamento dos Recebimentos:",
    formatItemLabel: (id, dateLabel) => `${id}º Recebimento - ${dateLabel}`,
    invalidValueMessage: "Insira um valor válido.",
    invalidRecurringValueMessage:
      "Insira um valor válido para os recebimentos.",
    registeredMessage: "Receita registrada!",
    updatedMessage: "Receita atualizada!",
  },
  [TRANSACTION_TYPES.expense]: {
    type: TRANSACTION_TYPES.expense,
    color: colors.expense,
    namePlaceholder: "Ex: Mercado, Aluguel...",
    singleTabLabel: "Despesa Única",
    recurringTabLabel: "Recorrente",
    newSingleTitle: "Nova Despesa",
    newRecurringTitle: "Nova Despesa Recorrente",
    editTitle: "Editar Despesa",
    singleValueLabel: "Valor (R$)",
    singleDateLabel: "Data",
    recurringDateLabel: "Data da 1ª Parcela",
    countLabel: "Quantidade de Parcelas",
    countModalTitle: "Selecione a Quantidade",
    recurringValueLabel: "Valor da Parcela (R$)",
    switchLabel: "Parcelas com valores diferentes?",
    detailLabel: "Detalhamento:",
    formatItemLabel: (id, dateLabel) => `${id}ª - ${dateLabel}`,
    invalidValueMessage: "Insira um valor válido.",
    invalidRecurringValueMessage: "Insira um valor de parcela válido.",
    registeredMessage: "Despesa registrada!",
    updatedMessage: "Despesa atualizada!",
  },
};
