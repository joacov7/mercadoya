import "../global.css";
import { Stack } from "expo-router";
import Constants from "expo-constants";
import { initFirebase } from "@mercadovivo/firebase";

// Inicializar Firebase con el config de Expo antes de cualquier otra cosa
const extra = Constants.expoConfig?.extra ?? {};
initFirebase({
  apiKey: extra.firebaseApiKey ?? "",
  authDomain: extra.firebaseAuthDomain ?? "",
  projectId: extra.firebaseProjectId ?? "",
  storageBucket: extra.firebaseStorageBucket ?? "",
  messagingSenderId: extra.firebaseMessagingSenderId ?? "",
  appId: extra.firebaseAppId ?? "",
});

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[chatId]" options={{ title: "Chat", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="login" options={{ title: "Ingresar", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="register" options={{ title: "Crear cuenta", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="busco/[id]" options={{ title: "Detalle", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="vendo/[id]" options={{ title: "Producto", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "#fff" }} />
    </Stack>
  );
}
