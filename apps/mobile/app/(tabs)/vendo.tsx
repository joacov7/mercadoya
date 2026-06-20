import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, ScrollView, ActivityIndicator, Modal,
} from "react-native";
import { router } from "expo-router";
import { usePublicacionesVendo } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { crearChat, enviarMensaje } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";
import type { PublicacionVendo } from "@mercadovivo/types";

function ModalMeInteresa({ pub, onClose }: { pub: PublicacionVendo; onClose: () => void }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleElegir = async (modalidad: "retiro" | "envio") => {
    if (!usuario) { router.push("/login"); return; }
    setLoading(true);
    try {
      const chatId = await crearChat({
        clienteId: usuario.id,
        comercioId: pub.comercioId,
        publicacionRelacionada: pub.id,
        tipo: "vendo",
      });
      const texto = modalidad === "retiro"
        ? `Hola! Me interesa "${pub.titulo}" — $${pub.precio.toLocaleString("es-AR")}. Paso a retirarlo en el local.`
        : `Hola! Me interesa "${pub.titulo}" — $${pub.precio.toLocaleString("es-AR")}. Necesito envío con cadete.`;
      await enviarMensaje(chatId, usuario.id, texto);
      onClose();
      router.push(`/chat/${chatId}` as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
          {pub.imagenes?.[0] ? (
            <Image source={{ uri: pub.imagenes[0] }} style={{ width: "100%", height: 200 }} resizeMode="cover"
              className="rounded-t-3xl" />
          ) : (
            <View className="h-32 bg-green-50 rounded-t-3xl items-center justify-center">
              <Text style={{ fontSize: 48 }}>🛍️</Text>
            </View>
          )}
          <View className="p-6">
            <Text className="font-bold text-gray-900 text-xl">{pub.titulo}</Text>
            <Text className="text-green-700 font-bold text-2xl mt-1">${pub.precio.toLocaleString("es-AR")}</Text>
            {pub.envioDisponible && (
              <Text className="text-sm text-blue-600 mt-1">🛵 Con envío disponible</Text>
            )}
            <Text className="text-sm font-semibold text-gray-700 mt-5 mb-3 text-center">¿Cómo querés recibirlo?</Text>
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center mb-3 ${loading ? "bg-green-300" : "bg-green-600"}`}
              onPress={() => handleElegir("retiro")}
              disabled={loading}
            >
              <Text className="text-white font-bold text-base">🏪 Retiro en local</Text>
            </TouchableOpacity>
            {pub.envioDisponible && (
              <TouchableOpacity
                className="py-4 rounded-2xl items-center border-2 border-green-600 mb-3"
                onPress={() => handleElegir("envio")}
                disabled={loading}
              >
                <Text className="text-green-700 font-bold text-base">🛵 Quiero envío con cadete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} className="py-2 items-center">
              <Text className="text-gray-400 text-sm">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CardVendo({ item, onMeInteresa, esMio }: {
  item: PublicacionVendo;
  onMeInteresa: () => void;
  esMio: boolean;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mb-4 mx-4 shadow-sm border border-gray-100"
      onPress={() => router.push(`/vendo/${item.id}` as any)}
      activeOpacity={0.9}
    >
      <View className="relative">
        {item.imagenes?.[0] ? (
          <Image source={{ uri: item.imagenes[0] }} style={{ width: "100%", height: 180 }} resizeMode="cover" />
        ) : (
          <View className="w-full bg-green-50 items-center justify-center" style={{ height: 180 }}>
            <Text style={{ fontSize: 48 }}>🛍️</Text>
          </View>
        )}
        {item.envioDisponible && (
          <View className="absolute top-2 left-2 bg-blue-500 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-semibold">🛵 Envío</Text>
          </View>
        )}
        {!item.stockDisponible && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <Text className="text-white font-bold text-lg">Sin stock</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="font-semibold text-gray-900 text-base flex-1 mr-2" numberOfLines={2}>{item.titulo}</Text>
          <View className="bg-green-100 px-2 py-0.5 rounded-full">
            <Text className="text-green-700 text-xs font-medium">{item.rubro}</Text>
          </View>
        </View>
        {item.descripcion ? (
          <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>{item.descripcion}</Text>
        ) : null}
        <View className="flex-row items-center justify-between">
          <Text className="text-green-700 font-bold text-xl">${item.precio.toLocaleString("es-AR")}</Text>
          {esMio ? (
            <View className="bg-green-100 px-3 py-1.5 rounded-xl">
              <Text className="text-green-700 text-xs font-semibold">Tu publicación</Text>
            </View>
          ) : (
            <TouchableOpacity
              className={`px-4 py-2 rounded-xl ${item.stockDisponible ? "bg-green-600" : "bg-gray-200"}`}
              onPress={onMeInteresa}
              disabled={!item.stockDisponible}
            >
              <Text className={`text-sm font-semibold ${item.stockDisponible ? "text-white" : "text-gray-400"}`}>
                💬 Me interesa
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedVendoScreen() {
  const { usuario } = useAuth();
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const [modalPub, setModalPub] = useState<PublicacionVendo | null>(null);
  const { publicaciones, loading } = usePublicacionesVendo(rubroFiltro);

  const filtradas = useMemo(() =>
    publicaciones.filter((p) =>
      p.titulo.toLowerCase().includes(busqueda.toLowerCase())
    ), [publicaciones, busqueda]
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
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" size="large" /></View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardVendo
              item={item}
              esMio={item.comercioId === usuario?.id}
              onMeInteresa={() => {
                if (!usuario) { router.push("/login"); return; }
                setModalPub(item);
              }}
            />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text style={{ fontSize: 48 }} className="mb-4">🏪</Text>
              <Text className="text-gray-500 text-base">No hay publicaciones aún</Text>
            </View>
          }
        />
      )}

      {modalPub && (
        <ModalMeInteresa pub={modalPub} onClose={() => setModalPub(null)} />
      )}
    </View>
  );
}
