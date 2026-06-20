import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { usePublicacionesVendo, usePublicacionesBusco } from "@mercadovivo/hooks";
import type { PublicacionVendo, PublicacionBusco } from "@mercadovivo/types";

function MiniCardVendo({ item }: { item: PublicacionVendo }) {
  return (
    <TouchableOpacity style={s.miniCard} onPress={() => router.push(`/vendo/${item.id}` as any)}>
      {item.imagenes?.[0] ? (
        <Image source={{ uri: item.imagenes[0] }} style={{ width: "100%", height: 110 }} resizeMode="cover" />
      ) : (
        <View style={[{ height: 110 }, s.miniCardImg]}>
          <Text style={{ fontSize: 36 }}>🛍️</Text>
        </View>
      )}
      <View style={s.miniCardBody}>
        <Text style={s.miniCardTitle} numberOfLines={2}>{item.titulo}</Text>
        <Text style={s.miniCardPrice}>${item.precio.toLocaleString("es-AR")}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CardBuscoMini({ item }: { item: PublicacionBusco }) {
  return (
    <TouchableOpacity style={s.buscoCard} onPress={() => router.push(`/busco/${item.id}` as any)}>
      <View style={s.buscoIcon}>
        <Text style={{ fontSize: 18 }}>🔍</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.buscoTitle} numberOfLines={1}>{item.titulo}</Text>
        <Text style={s.buscoRubro}>{item.rubro}</Text>
      </View>
      <Text style={{ color: "#d1d5db", fontSize: 18 }}>›</Text>
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
      <View style={s.guest}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={s.guestTitle}>MercadoVivo</Text>
        <Text style={s.guestSub}>El mercado local de Gualeguay</Text>
        <TouchableOpacity style={s.guestBtn} onPress={() => router.push("/register")}>
          <Text style={s.guestBtnText}>Registrarme gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={s.guestLink}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.root}>
      <View style={s.heroBg}>
        <Text style={s.heroSub}>Bienvenido de vuelta</Text>
        <Text style={s.heroName}>{usuario.nombre.split(" ")[0]} 👋</Text>
        <View style={s.heroActions}>
          <TouchableOpacity style={s.heroBtn} onPress={() => router.push("/(tabs)/publicar")}>
            <Text style={s.heroBtnText}>+ Publicar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.heroBtn} onPress={() => router.push("/(tabs)/vendo")}>
            <Text style={s.heroBtnText}>Ver Vendo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.heroBtn} onPress={() => router.push("/(tabs)/busco")}>
            <Text style={s.heroBtnText}>Ver Busco</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.content}>
        <View style={s.statsRow}>
          <TouchableOpacity style={s.statCard} onPress={() => router.push("/(tabs)/chats")}>
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text style={s.statNum}>{chats.length}</Text>
            <Text style={s.statLabel}>Chats</Text>
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.statCard} onPress={() => router.push("/(tabs)/perfil")}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text style={s.statNum}>{usuario.reputacion?.total ?? "—"}</Text>
            <Text style={s.statLabel}>Calificaciones</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Últimos en Vendo</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/vendo")}>
              <Text style={s.seeAll}>Ver todo</Text>
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

        {!loadingBusco && buscoRecientes.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Vecinos que buscan</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/busco")}>
                <Text style={s.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            {buscoRecientes.map((p) => <CardBuscoMini key={p.id} item={p} />)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },
  guest: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, backgroundColor: "white" },
  guestTitle: { fontSize: 24, fontWeight: "700", color: "#111827", marginTop: 16, textAlign: "center" },
  guestSub: { color: "#6b7280", textAlign: "center", marginTop: 8, marginBottom: 32 },
  guestBtn: { backgroundColor: "#16a34a", width: "100%", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  guestBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  guestLink: { color: "#16a34a", fontWeight: "500" },
  heroBg: { backgroundColor: "#16a34a", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  heroSub: { color: "#bbf7d0", fontSize: 13, fontWeight: "500" },
  heroName: { color: "white", fontSize: 24, fontWeight: "700", marginTop: 4 },
  heroActions: { flexDirection: "row", gap: 8, marginTop: 16 },
  heroBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, flex: 1, alignItems: "center" },
  heroBtnText: { color: "white", fontWeight: "600", fontSize: 13 },
  content: { paddingHorizontal: 16, marginTop: -16 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" },
  statNum: { fontSize: 24, fontWeight: "700", color: "#111827", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#9ca3af" },
  badge: { position: "absolute", top: 12, right: 12, backgroundColor: "#ef4444", width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "white", fontSize: 11, fontWeight: "700" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontWeight: "600", color: "#111827", fontSize: 16 },
  seeAll: { color: "#16a34a", fontSize: 13, fontWeight: "500" },
  miniCard: { width: 176, backgroundColor: "white", borderRadius: 16, overflow: "hidden", marginRight: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  miniCardImg: { alignItems: "center", justifyContent: "center", backgroundColor: "#f0fdf4" },
  miniCardBody: { padding: 12 },
  miniCardTitle: { fontWeight: "600", color: "#111827", fontSize: 13 },
  miniCardPrice: { color: "#15803d", fontWeight: "700", fontSize: 15, marginTop: 4 },
  buscoCard: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" },
  buscoIcon: { width: 40, height: 40, backgroundColor: "#fef3c7", borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
  buscoTitle: { fontWeight: "500", color: "#111827", fontSize: 13 },
  buscoRubro: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});
