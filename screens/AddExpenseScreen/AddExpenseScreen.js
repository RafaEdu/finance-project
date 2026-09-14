import React from "react";
import TransactionForm from "../../components/TransactionForm";
import { TRANSACTION_TYPES } from "../../constants/transactions";

export default function AddExpenseScreen(props) {
  return <TransactionForm type={TRANSACTION_TYPES.expense} {...props} />;
}
