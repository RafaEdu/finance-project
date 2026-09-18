import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROUTES } from "./constants/routes";
import { colors } from "./constants/colors";
import LoadingView from "./components/LoadingView";
import AppTabBar from "./components/AppTabBar";

import LoginScreen from "./screens/LoginScreen/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen/ForgotPasswordScreen";
import VerifyCodeScreen from "./screens/VerifyCodeScreen/VerifyCodeScreen";

import DashboardScreen from "./screens/DashboardScreen/DashboardScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen/AddExpenseScreen";
import AddIncomeScreen from "./screens/AddIncomeScreen/AddIncomeScreen";
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen";
import TagsScreen from "./screens/TagsScreen/TagsScreen";
import InsightsScreen from "./screens/InsightsScreen/InsightsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileHeaderButton({ navigation }) {
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <TouchableOpacity
      style={appStyles.profileButton}
      onPress={() => navigation.navigate(ROUTES.profile)}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={appStyles.profileImage} />
      ) : (
        <Ionicons
          name="person-circle-outline"
          size={38}
          color={colors.primary}
        />
      )}
    </TouchableOpacity>
  );
}

function HeaderGreeting() {
  const { displayName } = useAuth();

  return (
    <Text
      style={appStyles.greetingTitle}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      Olá, {displayName}
    </Text>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.dashboard}
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "left",
        headerTitle: () => <HeaderGreeting />,
        headerRight: () => <ProfileHeaderButton navigation={navigation} />,
      })}
    >
      <Tab.Screen
        name={ROUTES.dashboard}
        component={DashboardScreen}
        options={{ title: "Visão Geral" }}
      />
      <Tab.Screen
        name={ROUTES.newIncome}
        component={AddIncomeScreen}
        options={{ title: "Cadastrar Receita" }}
      />
      <Tab.Screen
        name={ROUTES.newExpense}
        component={AddExpenseScreen}
        options={{ title: "Cadastrar Despesa" }}
      />
      <Tab.Screen
        name={ROUTES.insights}
        component={InsightsScreen}
        options={{ title: "Insights" }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingView fullScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          // --- Pilha de Autenticado ---
          <Stack.Group>
            <Stack.Screen name={ROUTES.mainTabs} component={AppTabs} />
            <Stack.Screen
              name={ROUTES.profile}
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: "Meu Perfil",
                headerBackTitle: "Voltar",
              }}
            />
            <Stack.Screen
              name={ROUTES.tags}
              component={TagsScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerTitleAlign: "left",
                headerTitle: () => <HeaderGreeting />,
                headerRight: () => (
                  <ProfileHeaderButton navigation={navigation} />
                ),
                headerBackTitle: "Voltar",
              })}
            />
            {/* Nome DIFERENTE para quando estiver logado (Update) */}
            <Stack.Screen
              name={ROUTES.verifyUpdate}
              component={VerifyCodeScreen}
              options={{ headerShown: true, title: "Confirmar Alteração" }}
            />
          </Stack.Group>
        ) : (
          // --- Pilha de Não Autenticado ---
          <Stack.Group>
            <Stack.Screen name={ROUTES.login} component={LoginScreen} />
            <Stack.Screen name={ROUTES.register} component={RegisterScreen} />
            <Stack.Screen
              name={ROUTES.forgotPassword}
              component={ForgotPasswordScreen}
            />
            {/* Nome DIFERENTE para quando estiver deslogado (Cadastro/Recuperação) */}
            <Stack.Screen
              name={ROUTES.verifyAccount}
              component={VerifyCodeScreen}
              options={{ headerShown: true, title: "Verificar Conta" }}
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const appStyles = StyleSheet.create({
  greetingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    maxWidth: 220,
  },
  profileButton: {
    marginRight: 15,
    overflow: "hidden",
    borderRadius: 19,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
