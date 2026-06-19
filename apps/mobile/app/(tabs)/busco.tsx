import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { usePublicacionesBusco } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { crearOferta, crearChat } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";
import type { PublicacionBusco } from "@mercadovivo/types";

function tiempoRelativo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

function CardBusco({ item, esComercio, onOfrecer }: {
  item: PublicacionBusco;
  esComercio: boolean;
  onOfrecer: (p: PublicacionBusco) => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider">#Busco</Text>
          <Text className="font-semibold text-gray-900 text-base mt-0.5" numberOfLines={2}>{item.titulo}</Text>
        </View>
        <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2">
          <Text className="text-amber-700 text-xs font-medium">{item.rubro}</Text>
        </View>
      </View>
      {item.descripcion ? (
        <Text className="text-gray-500 text-sm mb-3" numberOfLines={3}>{item.descripcion}</Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">{tiempoRelativo(item.createdAt)}</Text>
        {esComercio && (
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-xl"
            onPress={() => onOfrecer(item)}
          >
            <Text className="text-white text-sm font-semibold">📦 Ofrecer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function FeedBuscoScreen() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const { publicaciones, loading } = usePublicacionesBusco(rubroFiltro);
  const { usuario } = useAuth();

  const handleOfrecer = (pub: PublicacionBusco) => {
    if (!usuario) { router.push("/login"); return; }
    Alert.prompt(
      "Ofrecer producto",
      "Describí tu oferta brevemente",
      async (mensaje) => {
        if (!mensaje) return;
        Alert.prompt("Precio", "Ingresá el precio", async (precioStr) => {
          if (!precioStr) return;
          const ofertaId = await crearOferta({
            publicacionBuscoId: pub.id,
            comercioId: usuario.id,
            mensaje,
            precio: Number(precioStr),
          });
          const chatId = await crearChat({
            clienteId: pub.clienteId,
            comercioId: usuario.id,
            publicacionRelacionada: pub.id,
            tipo: "busco",
          });
          router.push(`/chat/${chatId}`);
        });
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
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
          data={publicaciones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardBusco item={item} esComercio={usuario?.rol === "comercio"} onOfrecer={handleOfrecer} />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text className="text-gray-500 text-base">No hay solicitudes activas</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/(tabs)/publicar")}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
