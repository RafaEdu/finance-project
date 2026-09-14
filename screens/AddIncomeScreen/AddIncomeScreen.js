import React from "react";
import TransactionForm from "../../components/TransactionForm";
import { TRANSACTION_TYPES } from "../../constants/transactions";

export default function AddIncomeScreen(props) {
  return <TransactionForm type={TRANSACTION_TYPES.income} {...props} />;
}
