import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth, useChats } from "@mercadovivo/hooks";

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
    return <View style={s.center}><ActivityIndicator color="#16a34a" size="large" /></View>;
  }

  if (!usuario) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
        <Text style={s.emptyTitle}>Iniciá sesión para ver tus chats</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => router.push("/login")}>
          <Text style={s.loginBtnText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const noLeido = item.lastSenderId && item.lastSenderId !== usuario.id;
          return (
            <TouchableOpacity
              style={[s.chatItem, noLeido && s.chatItemUnread]}
              onPress={() => router.push(`/chat/${item.id}` as any)}
            >
              <View style={[s.avatar, item.tipo === "busco" ? s.avatarBusco : s.avatarVendo]}>
                <Text style={{ fontSize: 22 }}>{item.tipo === "busco" ? "🔍" : "🏪"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={s.chatType}>{item.tipo === "busco" ? "Busco" : "Vendo"}</Text>
                  <Text style={s.chatTime}>{tiempoRelativo(item.updatedAt)}</Text>
                </View>
                <Text style={[s.chatMsg, noLeido && s.chatMsgUnread]} numberOfLines={1}>
                  {item.lastMessage ?? "Sin mensajes aún"}
                </Text>
              </View>
              {noLeido && <View style={s.dot} />}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
            <Text style={s.emptyTitle}>No tenés conversaciones aún</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, color: "#6b7280", textAlign: "center" },
  loginBtn: { backgroundColor: "#16a34a", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  loginBtnText: { color: "white", fontWeight: "600" },
  chatItem: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" },
  chatItemUnread: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarBusco: { backgroundColor: "#fef3c7" },
  avatarVendo: { backgroundColor: "#dcfce7" },
  chatType: { fontSize: 11, color: "#9ca3af", fontWeight: "500", textTransform: "uppercase" },
  chatTime: { fontSize: 11, color: "#9ca3af" },
  chatMsg: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  chatMsgUnread: { fontWeight: "600", color: "#111827" },
  dot: { width: 12, height: 12, backgroundColor: "#22c55e", borderRadius: 6, marginLeft: 8 },
});
