import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { loginEmail } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginEmail(email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <Text className="text-5xl mb-3">🛒</Text>
          <Text className="text-2xl font-bold text-gray-900">{APP_NAME}</Text>
          <Text className="text-gray-500 text-sm mt-1">Ingresá a tu cuenta</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 border border-gray-100 gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
            <TextInput
              value={email} onChangeText={setEmail}
              placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none"
              placeholderTextColor="#9ca3af"
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Contraseña</Text>
            <TextInput
              value={password} onChangeText={setPassword}
              placeholder="••••••••" secureTextEntry
              placeholderTextColor="#9ca3af"
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
            />
          </View>
          <TouchableOpacity
            onPress={handleLogin} disabled={loading}
            className={`py-4 rounded-2xl items-center mt-2 ${loading ? "bg-green-300" : "bg-green-600"}`}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Ingresar</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-4 items-center" onPress={() => router.push("/register")}>
          <Text className="text-gray-500 text-sm">¿No tenés cuenta? <Text className="text-green-600 font-medium">Registrate</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
