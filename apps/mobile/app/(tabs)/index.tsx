import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { usePublicacionesVendo, usePublicacionesBusco } from "@mercadovivo/hooks";
import type { PublicacionVendo, PublicacionBusco } from "@mercadovivo/types";

function MiniCardVendo({ item }: { item: PublicacionVendo }) {
  return (
    <TouchableOpacity
      className="w-44 bg-white rounded-2xl overflow-hidden mr-3 border border-gray-100 shadow-sm"
      onPress={() => router.push(`/vendo/${item.id}` as any)}
    >
      {item.imagenes?.[0] ? (
        <Image source={{ uri: item.imagenes[0] }} style={{ width: "100%", height: 110 }} resizeMode="cover" />
      ) : (
        <View className="w-full items-center justify-center bg-green-50" style={{ height: 110 }}>
          <Text style={{ fontSize: 36 }}>🛍️</Text>
        </View>
      )}
      <View className="p-3">
        <Text className="font-semibold text-gray-900 text-sm" numberOfLines={2}>{item.titulo}</Text>
        <Text className="text-green-700 font-bold text-base mt-1">${item.precio.toLocaleString("es-AR")}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CardBuscoMini({ item }: { item: PublicacionBusco }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-2 border border-gray-100 flex-row items-center"
      onPress={() => router.push(`/busco/${item.id}` as any)}
    >
      <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
        <Text style={{ fontSize: 18 }}>🔍</Text>
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 text-sm" numberOfLines={1}>{item.titulo}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{item.rubro}</Text>
      </View>
      <Text className="text-gray-300 text-lg">›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { usuario } = useAuth();
  const { unreadCount, chats } = useChats(usuario?.id);
  const { publicaciones: vendo, loading: loadingVendo } = usePublicacionesVendo();
  const { publicaciones: busco, loading: loadingBusco } = usePublicacionesBusco();

  const vendoRecientes = vendo.filter((p) => p.comercioId !== usuario?.id).slice(0, 8);
  const buscoRecientes = busco.filter((p) => p.clienteId !== usuario?.id).slice(0, 4);

  if (!usuario) {
    return (
      <View className="flex-1 items-center justify-center px-8 bg-white">
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text className="text-2xl font-bold text-gray-900 mt-4 text-center">MercadoVivo</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">El mercado local de Gualeguay</Text>
        <TouchableOpacity className="bg-green-600 w-full py-4 rounded-2xl items-center mb-3" onPress={() => router.push("/register")}>
          <Text className="text-white font-bold text-base">Registrarme gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-green-600 font-medium">Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header saludo */}
      <View className="bg-green-600 px-5 pt-6 pb-8">
        <Text className="text-green-200 text-sm font-medium">Bienvenido de vuelta</Text>
        <Text className="text-white text-2xl font-bold mt-1">{usuario.nombre.split(" ")[0]} 👋</Text>
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-xl flex-1 items-center" onPress={() => router.push("/(tabs)/publicar")}>
            <Text className="text-white font-semibold text-sm">+ Publicar</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-xl flex-1 items-center" onPress={() => router.push("/(tabs)/vendo")}>
            <Text className="text-white font-semibold text-sm">Ver Vendo</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-xl flex-1 items-center" onPress={() => router.push("/(tabs)/busco")}>
            <Text className="text-white font-semibold text-sm">Ver Busco</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            onPress={() => router.push("/(tabs)/chats")}
          >
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">{chats.length}</Text>
            <Text className="text-xs text-gray-400">Chats</Text>
            {unreadCount > 0 && (
              <View className="absolute top-3 right-3 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            onPress={() => router.push("/(tabs)/perfil")}
          >
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">{usuario.reputacion?.total ?? "—"}</Text>
            <Text className="text-xs text-gray-400">Calificaciones</Text>
          </TouchableOpacity>
        </View>

        {/* Vendo reciente */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-semibold text-gray-900 text-base">Últimos en Vendo</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/vendo")}>
              <Text className="text-green-600 text-sm font-medium">Ver todo</Text>
            </TouchableOpacity>
          </View>
          {loadingVendo ? (
            <ActivityIndicator color="#16a34a" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendoRecientes.map((p) => <MiniCardVendo key={p.id} item={p} />)}
            </ScrollView>
          )}
        </View>

        {/* Busco reciente */}
        {!loadingBusco && buscoRecientes.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold text-gray-900 text-base">Vecinos que buscan</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/busco")}>
                <Text className="text-green-600 text-sm font-medium">Ver todo</Text>
              </TouchableOpacity>
            </View>
            {buscoRecientes.map((p) => <CardBuscoMini key={p.id} item={p} />)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
