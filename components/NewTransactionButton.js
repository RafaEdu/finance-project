import React from "react";
import AppButton from "./AppButton";
import { ROUTES } from "../constants/routes";
export default function NewTransactionButton({ navigation }) {
  return (
    <AppButton
      title="＋ Novo lançamento"
      onPress={() => navigation.navigate(ROUTES.transaction)}
    />
  );
}
