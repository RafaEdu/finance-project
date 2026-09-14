import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { colors } from "../constants/colors";
import AppButton from "./AppButton";

// Modal para escolher uma tag dentre as cadastradas.
export default function TagPickerModal({
  visible,
  tags = [],
  onSelect,
  onClose,
  accentColor = colors.accent,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Selecione uma Tag</Text>

          <FlatList
            data={tags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <View style={styles.itemRow}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: item.color || colors.accent },
                    ]}
                  />
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhuma tag cadastrada.</Text>
            }
          />

          <AppButton title="Fechar" onPress={onClose} color={accentColor} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: colors.text,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: "center",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  itemText: {
    fontSize: 18,
    color: colors.text,
  },
  empty: {
    textAlign: "center",
    color: colors.placeholder,
    padding: 20,
  },
});
