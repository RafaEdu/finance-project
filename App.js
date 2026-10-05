import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { ROUTES } from "./constants/routes";
import { colors } from "./constants/colors";
import LoadingView from "./components/LoadingView";
import TransactionForm from "./components/TransactionForm";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen/ForgotPasswordScreen";
import VerifyCodeScreen from "./screens/VerifyCodeScreen/VerifyCodeScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen/ResetPasswordScreen";
import DashboardScreen from "./screens/DashboardScreen/DashboardScreen";
import TransactionsScreen from "./screens/TransactionsScreen/TransactionsScreen";
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen";
import TagsScreen from "./screens/TagsScreen/TagsScreen";
import InsightsScreen from "./screens/InsightsScreen/InsightsScreen";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ICONS = {
  [ROUTES.dashboard]: "home-outline",
  [ROUTES.transactions]: "list-outline",
  [ROUTES.insights]: "bar-chart-outline",
  [ROUTES.profile]: "person-outline",
};
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.borderLight,
  },
};
function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen
        name={ROUTES.dashboard}
        component={DashboardScreen}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name={ROUTES.transactions}
        component={TransactionsScreen}
        options={{ title: "Movimentações", tabBarLabel: "Movimentos" }}
      />
      <Tab.Screen
        name={ROUTES.insights}
        component={InsightsScreen}
        options={{ title: "Relatórios" }}
      />
      <Tab.Screen
        name={ROUTES.profile}
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
function Navigation() {
  const { session, loading, recovery } = useAuth();
  if (loading) return <LoadingView fullScreen />;
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && recovery ? (
          <Stack.Screen
            name={ROUTES.resetPassword}
            component={ResetPasswordScreen}
          />
        ) : session ? (
          <Stack.Group>
            <Stack.Screen name={ROUTES.mainTabs} component={AppTabs} />
            <Stack.Screen
              name={ROUTES.transaction}
              component={TransactionForm}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name={ROUTES.tags} component={TagsScreen} />
            <Stack.Screen
              name={ROUTES.verifyUpdate}
              component={VerifyCodeScreen}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name={ROUTES.login} component={LoginScreen} />
            <Stack.Screen name={ROUTES.register} component={RegisterScreen} />
            <Stack.Screen
              name={ROUTES.forgotPassword}
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name={ROUTES.verifyAccount}
              component={VerifyCodeScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AuthProvider>
        <PreferencesProvider>
          <Navigation />
        </PreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
