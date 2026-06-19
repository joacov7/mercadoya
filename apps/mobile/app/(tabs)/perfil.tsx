import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { logout } from "@mercadovivo/firebase";

export default function PerfilScreen() {
  const { usuario, loading } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!usuario) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-4">👤</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">Creá tu cuenta o ingresá</Text>
        <TouchableOpacity className="bg-green-600 px-8 py-3.5 rounded-xl mt-4 w-full items-center" onPress={() => router.push("/register")}>
          <Text className="text-white font-bold text-base">Registrarse gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3" onPress={() => router.push("/login")}>
          <Text className="text-green-600 font-medium text-sm">Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-600 pt-12 pb-8 px-6 items-center">
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3">
          <Text className="text-white font-bold text-3xl">
            {usuario.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-white font-bold text-xl">{usuario.nombre}</Text>
        <Text className="text-green-100 text-sm mt-0.5">{usuario.email}</Text>
        <View className="mt-2 bg-white/20 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium capitalize">{usuario.rol}</Text>
        </View>
      </View>

      <View className="p-6 flex flex-col gap-4">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-medium">Información</Text>
          <View className="flex-col gap-3">
            <Row label="Teléfono" value={usuario.telefono} />
            <Row label="WhatsApp" value={usuario.whatsapp} />
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-50 border border-red-100 rounded-2xl p-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-semibold">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium">{value}</Text>
    </View>
  );
}
