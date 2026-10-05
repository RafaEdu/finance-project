import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { ui } from "../constants/theme";
export default function Sheet({ visible, title, onClose, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(15,23,42,0.45)",
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.surface,
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            maxHeight: "90%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: Math.max(insets.bottom, 20),
            gap: 16,
          }}
        >
          <View style={ui.between}>
            <Text accessibilityRole="header" style={[ui.heading, { flex: 1 }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={ui.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16 }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
