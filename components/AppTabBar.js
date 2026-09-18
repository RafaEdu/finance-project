import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import { ROUTES } from "../constants/routes";
import { colors } from "../constants/colors";

// Distância da base da tela até o topo da "placa" do menu.
export const TAB_BAR_BOTTOM_OFFSET = 10;

const TABS = {
  [ROUTES.dashboard]: {
    icon: "search-outline",
    activeIcon: "search",
    label: "Visão Geral",
  },
  [ROUTES.newIncome]: {
    icon: "arrow-up-circle-outline",
    activeIcon: "arrow-up-circle",
    label: "Receita",
  },
  [ROUTES.newExpense]: {
    icon: "arrow-down-circle-outline",
    activeIcon: "arrow-down-circle",
    label: "Despesa",
  },
  [ROUTES.insights]: {
    icon: "analytics-outline",
    activeIcon: "analytics",
    label: "Insights",
  },
};

export default function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const setTabBarHeight = useContext(BottomTabBarHeightCallbackContext);
  const [plateHeight, setPlateHeight] = useState(0);

  const bottomOffset = Math.max(insets.bottom, 16) + TAB_BAR_BOTTOM_OFFSET;

  // Informa ao navegador a altura total ocupada pela barra (placa + margem),
  // permitindo que as telas reservem espaço e não escondam o último item.
  useEffect(() => {
    if (plateHeight && setTabBarHeight) {
      setTabBarHeight(plateHeight + bottomOffset);
    }
  }, [plateHeight, bottomOffset, setTabBarHeight]);

  return (
    <View
      style={[styles.container, { bottom: bottomOffset }]}
      onLayout={(event) => setPlateHeight(event.nativeEvent.layout.height)}
    >
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) {
          return null;
        }

        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.textSubtle;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              descriptors[route.key]?.options?.tabBarAccessibilityLabel
            }
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}
            style={[styles.item, isFocused && styles.itemActive]}
          >
            <Ionicons
              name={isFocused ? config.activeIcon : config.icon}
              size={22}
              color={color}
            />
            {isFocused && (
              <Text style={styles.label} numberOfLines={1}>
                {config.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
  },
  itemActive: {
    backgroundColor: "rgba(0, 0, 255, 0.08)",
  },
  label: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});
