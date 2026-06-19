import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { registerEmail } from "@mercadovivo/firebase";
import { crearUsuario } from "@mercadovivo/core";
import { APP_NAME, ROLES, type Rol } from "@mercadovivo/config";

const ROLES_SELECCIONABLES = ROLES.filter((r) => r !== "admin");

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<Rol>("cliente");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !telefono) {
      Alert.alert("Completá todos los campos");
      return;
    }
    setLoading(true);
    try {
      const { user } = await registerEmail(email, password);
      await crearUsuario(user.uid, { nombre, email, telefono, whatsapp: telefono, rol });
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-10">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">🛒</Text>
          <Text className="text-2xl font-bold text-gray-900">{APP_NAME}</Text>
          <Text className="text-gray-500 text-sm mt-1">Creá tu cuenta gratis</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 border border-gray-100 gap-4">
          {[
            { label: "Nombre completo", value: nombre, set: setNombre, placeholder: "Juan García" },
            { label: "Email", value: email, set: setEmail, placeholder: "tu@email.com", keyType: "email-address" as const, autoCapitalize: "none" as const },
            { label: "Teléfono / WhatsApp", value: telefono, set: setTelefono, placeholder: "3446123456", keyType: "phone-pad" as const },
            { label: "Contraseña", value: password, set: setPassword, placeholder: "Mínimo 6 caracteres", secure: true },
          ].map(({ label, value, set, placeholder, keyType, autoCapitalize, secure }) => (
            <View key={label}>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
              <TextInput
                value={value}
                onChangeText={set}
                placeholder={placeholder}
                keyboardType={keyType}
                autoCapitalize={autoCapitalize ?? "words"}
                secureTextEntry={secure}
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
              />
            </View>
          ))}

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Soy...</Text>
            <View className="flex-row gap-2 flex-wrap">
              {ROLES_SELECCIONABLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRol(r)}
                  className={`px-4 py-2 rounded-xl border ${rol === r ? "bg-green-600 border-green-600" : "bg-gray-50 border-gray-200"}`}
                >
                  <Text className={`text-sm font-medium capitalize ${rol === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`py-4 rounded-2xl items-center mt-2 ${loading ? "bg-green-300" : "bg-green-600"}`}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Crear cuenta</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-4 items-center" onPress={() => router.push("/login")}>
          <Text className="text-gray-500 text-sm">¿Ya tenés cuenta? <Text className="text-green-600 font-medium">Ingresá</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
