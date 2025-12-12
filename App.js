import React from "react";
import { StatusBar, StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Telas de Autenticação
import LoginScreen from "./screens/LoginScreen/LoginScreen.js";
import RegisterScreen from "./screens/RegisterScreen/RegisterScreen.js";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen/ForgotPasswordScreen.js";

// Telas da Aplicação
import DashboardScreen from "./screens/DashboardScreen/DashboardScreen.js";
import AddExpenseScreen from "./screens/AddExpenseScreen/AddExpenseScreen.js";
import AddIncomeScreen from "./screens/AddIncomeScreen/AddIncomeScreen.js";
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen.js";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Componente da Bottom Bar (Tab Navigator) ---
function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: true, // Cabeçalho das abas
        tabBarActiveTintColor: "#0000ff",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Nova Despesa") {
            iconName = focused
              ? "arrow-down-circle"
              : "arrow-down-circle-outline";
          } else if (route.name === "Dashboard") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Nova Receita") {
            iconName = focused ? "arrow-up-circle" : "arrow-up-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Nova Despesa"
        component={AddExpenseScreen}
        options={{ title: "Cadastrar Despesa" }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Visão Geral" }}
      />
      <Tab.Screen
        name="Nova Receita"
        component={AddIncomeScreen}
        options={{ title: "Cadastrar Receita" }}
      />
    </Tab.Navigator>
  );
}

// --- Componente de Navegação Principal (Stack) ---
function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          // Pilha de Autenticado
          <Stack.Group>
            {/* O AppTabs é a tela principal */}
            <Stack.Screen name="MainTabs" component={AppTabs} />

            {/* O Profile é uma tela extra que fica "em cima" das abas */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: "Meu Perfil",
                headerBackTitle: "Voltar", // Texto do botão voltar no iOS
              }}
            />
          </Stack.Group>
        ) : (
          // Pilha de Não Autenticado
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
