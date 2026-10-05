import React from "react";
import AuthForm from "../../components/AuthForm";
export default function ForgotPasswordScreen(props) {
  return <AuthForm {...props} kind="forgot" />;
}
