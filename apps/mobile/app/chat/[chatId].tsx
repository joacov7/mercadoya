import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChat } from "@mercadovivo/hooks";
import {
  crearPedido, actualizarEstadoPedido, suscribirPedido,
  calificarPedido, yaCalificó,
} from "@mercadovivo/core";
import { db, COLECCIONES, doc, getDoc } from "@mercadovivo/firebase";
import type { Chat, Pedido } from "@mercadovivo/types";

const ESTADOS_LABEL: Record<string, string> = {
  pendiente: "⏳ Pendiente",
  aceptado: "✅ Aceptado",
  listo: "📦 Listo",
  entregado: "🎉 Entregado",
  cancelado: "❌ Cancelado",
};

const ESTADOS_COLOR: Record<string, string> = {
  pendiente: "#fef3c7",
  aceptado: "#dbeafe",
  listo: "#ede9fe",
  entregado: "#dcfce7",
  cancelado: "#fee2e2",
};

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { usuario } = useAuth();
  const { mensajes, loading, enviar } = useChat(chatId!, usuario?.id ?? "");
  const [texto, setTexto] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [yaCalifiqué, setYaCalifiqué] = useState(false);
  const [showCalificar, setShowCalificar] = useState(false);
  const [pulgar, setPulgar] = useState<"positivo" | "negativo" | null>(null);
  const [resena, setResena] = useState("");
  const [loadingAccion, setLoadingAccion] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, COLECCIONES.CHATS, chatId)).then((snap) => {
      if (snap.exists()) setChat(snap.data() as Chat);
    });
  }, [chatId]);

  useEffect(() => {
    if (!chat?.pedidoId) return;
    return suscribirPedido(chat.pedidoId, setPedido);
  }, [chat?.pedidoId]);

  useEffect(() => {
    if (!pedido || !usuario) return;
    yaCalificó(pedido.id, usuario.id).then(setYaCalifiqué);
  }, [pedido, usuario]);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mensajes]);

  const esComercio = !!usuario && !!chat && chat.comercioId === usuario.id;
  const primerMensaje = mensajes[0]?.texto ?? "";
  const necesitaEnvio = primerMensaje.includes("envío con cadete");

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    await enviar(texto);
    setTexto("");
  };

  const handleAceptar = async () => {
    if (!usuario || !chat || !chatId) return;
    setLoadingAccion(true);
    try {
      if (!chat.pedidoId) {
        const pedidoId = await crearPedido({
          chatId,
          clienteId: chat.clienteId,
          comercioId: chat.comercioId,
          publicacionId: chat.publicacionRelacionada,
          titulo: primerMensaje.split('"')[1] ?? "Producto",
          precio: 0,
          modalidad: necesitaEnvio ? "envio" : "retiro",
          estado: "aceptado",
          calificacionCliente: false,
          calificacionComercio: false,
        });
        setChat((prev) => prev ? { ...prev, pedidoId } : prev);
        await enviar("✅ Pedido aceptado. Me estoy preparando.");
      } else {
        await actualizarEstadoPedido(chat.pedidoId, "aceptado");
        await enviar("✅ Pedido aceptado.");
      }
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleCalificar = async () => {
    if (!pedido || !usuario || !pulgar) return;
    setLoadingAccion(true);
    try {
      const destinatarioId = esComercio ? pedido.clienteId : pedido.comercioId;
      const campo = esComercio ? "calificacionComercio" : "calificacionCliente";
      await calificarPedido(pedido.id, campo, {
        pedidoId: pedido.id,
        remitenteId: usuario.id,
        destinatarioId,
        pulgar,
        resena,
      });
      setYaCalifiqué(true);
      setShowCalificar(false);
    } finally {
      setLoadingAccion(false);
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" size="large" /></View>;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Estado del pedido */}
      {pedido && (
        <View style={{ backgroundColor: ESTADOS_COLOR[pedido.estado] }} className="px-4 py-3">
          <Text className="text-gray-800 font-semibold text-sm text-center">
            {ESTADOS_LABEL[pedido.estado]}
          </Text>
        </View>
      )}

      {/* Acciones */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row flex-wrap gap-2">
        {esComercio && (!pedido || pedido.estado === "pendiente") && (
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${loadingAccion ? "bg-green-300" : "bg-green-600"}`}
            onPress={handleAceptar}
            disabled={loadingAccion}
          >
            <Text className="text-white text-sm font-semibold">✅ Aceptar pedido</Text>
          </TouchableOpacity>
        )}
        {esComercio && pedido?.estado === "aceptado" && (
          <TouchableOpacity
            className="bg-purple-600 px-4 py-2 rounded-xl"
            onPress={async () => {
              setLoadingAccion(true);
              await actualizarEstadoPedido(pedido.id, "listo");
              await enviar(necesitaEnvio ? "🛵 El pedido está en camino." : "📦 Listo para retirar en el local.");
              setLoadingAccion(false);
            }}
            disabled={loadingAccion}
          >
            <Text className="text-white text-sm font-semibold">{necesitaEnvio ? "🛵 En camino" : "📦 Listo"}</Text>
          </TouchableOpacity>
        )}
        {esComercio && pedido?.estado === "listo" && (
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-xl"
            onPress={async () => {
              setLoadingAccion(true);
              await actualizarEstadoPedido(pedido.id, "entregado");
              await enviar("🎉 Pedido entregado. ¡Gracias!");
              setShowCalificar(true);
              setLoadingAccion(false);
            }}
            disabled={loadingAccion}
          >
            <Text className="text-white text-sm font-semibold">🎉 Entregado</Text>
          </TouchableOpacity>
        )}
        {pedido?.estado === "entregado" && !yaCalifiqué && (
          <TouchableOpacity
            className="bg-amber-500 px-4 py-2 rounded-xl"
            onPress={() => setShowCalificar(true)}
          >
            <Text className="text-white text-sm font-semibold">⭐ Calificar</Text>
          </TouchableOpacity>
        )}
        {yaCalifiqué && (
          <Text className="text-xs text-gray-400 self-center">✓ Ya calificaste</Text>
        )}
      </View>

      {/* Calificar */}
      {showCalificar && (
        <View className="bg-green-50 border-b border-green-200 p-4">
          <Text className="font-semibold text-green-800 text-sm mb-3">⭐ Calificá tu experiencia</Text>
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border-2 items-center ${pulgar === "positivo" ? "border-green-500 bg-green-100" : "border-gray-200 bg-white"}`}
              onPress={() => setPulgar("positivo")}
            >
              <Text className="text-lg">👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border-2 items-center ${pulgar === "negativo" ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
              onPress={() => setPulgar("negativo")}
            >
              <Text className="text-lg">👎</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={resena}
            onChangeText={setResena}
            placeholder="Escribí una reseña (opcional)..."
            placeholderTextColor="#9ca3af"
            multiline
            className="bg-white border border-green-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 mb-3"
            style={{ minHeight: 60 }}
          />
          <TouchableOpacity
            className={`py-3 rounded-xl items-center ${!pulgar || loadingAccion ? "bg-green-300" : "bg-green-600"}`}
            onPress={handleCalificar}
            disabled={!pulgar || loadingAccion}
          >
            <Text className="text-white font-semibold">Enviar calificación</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mensajes */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          const esMio = item.remitenteId === usuario?.id;
          return (
            <View className={`flex-row ${esMio ? "justify-end" : "justify-start"}`}>
              <View className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                esMio ? "bg-green-600 rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"
              }`}>
                <Text className={esMio ? "text-white" : "text-gray-900"}>{item.texto}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-400 text-sm">Todavía no hay mensajes. ¡Escribí el primero!</Text>
          </View>
        }
      />

      {/* Input */}
      <View className="flex-row items-center gap-2 px-4 pb-4 pt-2 bg-white border-t border-gray-100">
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleEnviar}
          className="bg-green-600 w-11 h-11 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-xl">↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
