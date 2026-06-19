import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { usePublicacionesVendo } from "@mercadovivo/hooks";
import { RUBROS, type Rubro, APP_WHATSAPP_DEFAULT } from "@mercadovivo/config";
import type { PublicacionVendo } from "@mercadovivo/types";

function CardVendo({ item }: { item: PublicacionVendo }) {
  const url = `https://wa.me/${APP_WHATSAPP_DEFAULT}?text=${encodeURIComponent(`Hola! Me interesa: "${item.titulo}"`)}`;
  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4 mx-4 shadow-sm border border-gray-100">
      {item.imagenes?.[0] ? (
        <Image source={{ uri: item.imagenes[0] }} className="w-full h-44" resizeMode="cover" />
      ) : (
        <View className="w-full h-44 bg-green-50 items-center justify-center">
          <Text className="text-5xl">🛍️</Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2 mb-1">
          <Text className="font-semibold text-gray-900 text-base flex-1" numberOfLines={2}>{item.titulo}</Text>
          <View className="bg-green-100 px-2 py-0.5 rounded-full">
            <Text className="text-green-700 text-xs font-medium">{item.rubro}</Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>{item.descripcion}</Text>
        {item.precio > 0 && (
          <Text className="text-green-700 font-bold text-lg mb-3">
            ${item.precio.toLocaleString("es-AR")}
          </Text>
        )}
        <TouchableOpacity
          className="bg-amber-500 py-3 rounded-xl items-center"
          onPress={() => Linking.openURL(url)}
        >
          <Text className="text-white font-semibold">💬 Me interesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedVendoScreen() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const { publicaciones, loading } = usePublicacionesVendo(rubroFiltro);

  const filtradas = publicaciones.filter((p) =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 mb-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            placeholder="Buscar productos..."
            value={busqueda}
            onChangeText={setBusqueda}
            className="flex-1 text-sm text-gray-900"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setRubroFiltro(undefined)}
            className={`mr-2 px-4 py-2 rounded-full border ${!rubroFiltro ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
          >
            <Text className={`text-sm font-medium ${!rubroFiltro ? "text-white" : "text-gray-600"}`}>Todos</Text>
          </TouchableOpacity>
          {RUBROS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRubroFiltro(r === rubroFiltro ? undefined : r)}
              className={`mr-2 px-4 py-2 rounded-full border ${rubroFiltro === r ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-sm font-medium ${rubroFiltro === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#16a34a" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardVendo item={item} />}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-4xl mb-4">🏪</Text>
              <Text className="text-gray-500 text-base">No hay publicaciones aún</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
