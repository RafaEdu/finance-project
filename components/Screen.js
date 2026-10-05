import React from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ui } from "../constants/theme";
export default function Screen({ children, contentStyle, refreshControl }) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={ui.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[ui.content, contentStyle]}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
