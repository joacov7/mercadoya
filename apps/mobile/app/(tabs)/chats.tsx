import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 2) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

export default function ChatsScreen() {
  const { usuario, loading: authLoading } = useAuth();
  const { chats, loading } = useChats(usuario?.id);

  if (authLoading || loading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" size="large" /></View>;
  }

  if (!usuario) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontSize: 48 }} className="mb-4">🔐</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">Iniciá sesión para ver tus chats</Text>
        <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-xl mt-4" onPress={() => router.push("/login")}>
          <Text className="text-white font-semibold">Ingresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const noLeido = item.lastSenderId && item.lastSenderId !== usuario.id;
          return (
            <TouchableOpacity
              className={`mx-4 mb-2 rounded-2xl p-4 border flex-row items-center ${
                noLeido ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
              }`}
              onPress={() => router.push(`/chat/${item.id}` as any)}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                item.tipo === "busco" ? "bg-amber-100" : "bg-green-100"
              }`}>
                <Text style={{ fontSize: 22 }}>{item.tipo === "busco" ? "🔍" : "🏪"}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-400 font-medium uppercase">
                    {item.tipo === "busco" ? "Busco" : "Vendo"}
                  </Text>
                  <Text className="text-xs text-gray-400">{tiempoRelativo(item.updatedAt)}</Text>
                </View>
                <Text
                  className={`text-sm mt-0.5 ${noLeido ? "font-semibold text-gray-900" : "text-gray-600"}`}
                  numberOfLines={1}
                >
                  {item.lastMessage ?? "Sin mensajes aún"}
                </Text>
              </View>
              {noLeido && (
                <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View className="items-center py-24">
            <Text style={{ fontSize: 48 }} className="mb-4">💬</Text>
            <Text className="text-gray-500 text-base">No tenés conversaciones aún</Text>
          </View>
        }
      />
    </View>
  );
}
