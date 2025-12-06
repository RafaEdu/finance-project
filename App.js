import React from "react";
import { NavigationContainer } from "@react-navigation/native";
// Mudança 1: Usar o Stack JS ao invés do Native Stack
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";
// Mudança 2: Importar GestureHandlerRootView
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Telas
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";

// Mudança 3: Criar o Stack Navigator (JS)
const Stack = createStackNavigator();

function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          // Pilha de Autenticado
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Pilha de Não Autenticado
          <Stack.Group screenOptions={{ headerShown: false }}>
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
    // Mudança 4: Envolver tudo com GestureHandlerRootView para funcionar com New Arch
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
