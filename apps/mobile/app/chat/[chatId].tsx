import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth, useChat } from "@mercadovivo/hooks";
import {
  crearPedido, actualizarEstadoPedido, suscribirPedido,
  calificarPedido, yaCalificó,
} from "@mercadovivo/core";
import { getDb, COLECCIONES, doc, getDoc } from "@mercadovivo/firebase";
import type { Chat, Pedido } from "@mercadovivo/types";

const ESTADOS_LABEL: Record<string, string> = {
  pendiente: "⏳ Pendiente", aceptado: "✅ Aceptado",
  listo: "📦 Listo", entregado: "🎉 Entregado", cancelado: "❌ Cancelado",
};
const ESTADOS_COLOR: Record<string, string> = {
  pendiente: "#fef3c7", aceptado: "#dbeafe",
  listo: "#ede9fe", entregado: "#dcfce7", cancelado: "#fee2e2",
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
    getDoc(doc(getDb(), COLECCIONES.CHATS, chatId)).then((snap) => {
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
    if (mensajes.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
          chatId, clienteId: chat.clienteId, comercioId: chat.comercioId,
          publicacionId: chat.publicacionRelacionada,
          titulo: primerMensaje.split('"')[1] ?? "Producto",
          precio: 0, modalidad: necesitaEnvio ? "envio" : "retiro",
          estado: "aceptado", calificacionCliente: false, calificacionComercio: false,
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
      await calificarPedido(pedido.id, campo, { pedidoId: pedido.id, remitenteId: usuario.id, destinatarioId, pulgar, resena });
      setYaCalifiqué(true);
      setShowCalificar(false);
    } finally {
      setLoadingAccion(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#16a34a" size="large" /></View>;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      {pedido && (
        <View style={[s.estadoBanner, { backgroundColor: ESTADOS_COLOR[pedido.estado] }]}>
          <Text style={s.estadoText}>{ESTADOS_LABEL[pedido.estado]}</Text>
        </View>
      )}

      <View style={s.actionsBar}>
        {esComercio && (!pedido || pedido.estado === "pendiente") && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: loadingAccion ? "#86efac" : "#16a34a" }]}
            onPress={handleAceptar} disabled={loadingAccion}>
            <Text style={s.actionBtnText}>✅ Aceptar pedido</Text>
          </TouchableOpacity>
        )}
        {esComercio && pedido?.estado === "aceptado" && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#7c3aed" }]}
            onPress={async () => {
              setLoadingAccion(true);
              await actualizarEstadoPedido(pedido.id, "listo");
              await enviar(necesitaEnvio ? "🛵 El pedido está en camino." : "📦 Listo para retirar en el local.");
              setLoadingAccion(false);
            }} disabled={loadingAccion}>
            <Text style={s.actionBtnText}>{necesitaEnvio ? "🛵 En camino" : "📦 Listo"}</Text>
          </TouchableOpacity>
        )}
        {esComercio && pedido?.estado === "listo" && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#16a34a" }]}
            onPress={async () => {
              setLoadingAccion(true);
              await actualizarEstadoPedido(pedido.id, "entregado");
              await enviar("🎉 Pedido entregado. ¡Gracias!");
              setShowCalificar(true);
              setLoadingAccion(false);
            }} disabled={loadingAccion}>
            <Text style={s.actionBtnText}>🎉 Entregado</Text>
          </TouchableOpacity>
        )}
        {pedido?.estado === "entregado" && !yaCalifiqué && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#f59e0b" }]} onPress={() => setShowCalificar(true)}>
            <Text style={s.actionBtnText}>⭐ Calificar</Text>
          </TouchableOpacity>
        )}
        {yaCalifiqué && <Text style={s.yaCalif}>✓ Ya calificaste</Text>}
      </View>

      {showCalificar && (
        <View style={s.calificarBox}>
          <Text style={s.calificarTitle}>⭐ Calificá tu experiencia</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <TouchableOpacity style={[s.pulgarBtn, pulgar === "positivo" && s.pulgarPos]} onPress={() => setPulgar("positivo")}>
              <Text style={{ fontSize: 24 }}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.pulgarBtn, pulgar === "negativo" && s.pulgarNeg]} onPress={() => setPulgar("negativo")}>
              <Text style={{ fontSize: 24 }}>👎</Text>
            </TouchableOpacity>
          </View>
          <TextInput value={resena} onChangeText={setResena} placeholder="Escribí una reseña (opcional)..."
            placeholderTextColor="#9ca3af" multiline style={s.resenaInput} />
          <TouchableOpacity style={[s.calificarBtn, (!pulgar || loadingAccion) && { backgroundColor: "#86efac" }]}
            onPress={handleCalificar} disabled={!pulgar || loadingAccion}>
            <Text style={{ color: "white", fontWeight: "600" }}>Enviar calificación</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          const esMio = item.remitenteId === usuario?.id;
          return (
            <View style={{ flexDirection: "row", justifyContent: esMio ? "flex-end" : "flex-start" }}>
              <View style={[s.bubble, esMio ? s.bubbleMio : s.bubbleOtro]}>
                <Text style={{ color: esMio ? "white" : "#111827" }}>{item.texto}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyMsg}>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>Todavía no hay mensajes. ¡Escribí el primero!</Text>
          </View>
        }
      />

      <View style={s.inputBar}>
        <TextInput value={texto} onChangeText={setTexto} placeholder="Escribí un mensaje..."
          placeholderTextColor="#9ca3af" style={s.msgInput} multiline maxLength={500} />
        <TouchableOpacity style={s.sendBtn} onPress={handleEnviar}>
          <Text style={{ color: "white", fontSize: 20 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  estadoBanner: { paddingHorizontal: 16, paddingVertical: 12 },
  estadoText: { color: "#1f2937", fontWeight: "600", fontSize: 14, textAlign: "center" },
  actionsBar: { backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  actionBtnText: { color: "white", fontSize: 13, fontWeight: "600" },
  yaCalif: { fontSize: 12, color: "#9ca3af", alignSelf: "center" },
  calificarBox: { backgroundColor: "#f0fdf4", borderBottomWidth: 1, borderBottomColor: "#bbf7d0", padding: 16 },
  calificarTitle: { fontWeight: "600", color: "#15803d", fontSize: 14, marginBottom: 12 },
  pulgarBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "white", alignItems: "center" },
  pulgarPos: { borderColor: "#22c55e", backgroundColor: "#dcfce7" },
  pulgarNeg: { borderColor: "#f87171", backgroundColor: "#fef2f2" },
  resenaInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", minHeight: 60, marginBottom: 12 },
  calificarBtn: { backgroundColor: "#16a34a", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  bubble: { maxWidth: "80%", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  bubbleMio: { backgroundColor: "#16a34a", borderBottomRightRadius: 4 },
  bubbleOtro: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderBottomLeftRadius: 4 },
  emptyMsg: { alignItems: "center", paddingVertical: 48 },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  msgInput: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#111827" },
  sendBtn: { backgroundColor: "#16a34a", width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
