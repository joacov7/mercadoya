import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { listarChatsUsuario } from "@mercadovivo/core";
import type { Chat } from "@mercadovivo/types";

export default function ChatsScreen() {
  const { usuario, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) { setLoading(false); return; }
    listarChatsUsuario(usuario.id).then((data) => {
      setChats(data);
      setLoading(false);
    });
  }, [usuario]);

  if (authLoading || loading) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" size="large" /></View>;
  }

  if (!usuario) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-4">🔐</Text>
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
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white mx-4 mb-2 rounded-2xl p-4 border border-gray-100 flex-row items-center"
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-2xl">{item.tipo === "busco" ? "🔍" : "🛍️"}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-medium uppercase">{item.tipo === "busco" ? "#Busco" : "#Vendo"}</Text>
              <Text className="text-gray-700 text-sm mt-0.5" numberOfLines={1}>
                {item.lastMessage ?? "Sin mensajes aún"}
              </Text>
            </View>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View className="items-center py-24">
            <Text className="text-4xl mb-4">💬</Text>
            <Text className="text-gray-500 text-base">No tenés conversaciones aún</Text>
          </View>
        }
      />
    </View>
  );
}
