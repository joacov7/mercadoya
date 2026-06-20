import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, ScrollView, ActivityIndicator, Modal, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { usePublicacionesVendo, useAuth } from "@mercadovivo/hooks";
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
      const chatId = await crearChat({ clienteId: usuario.id, comercioId: pub.comercioId, publicacionRelacionada: pub.id, tipo: "vendo" });
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
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet}>
          {pub.imagenes?.[0] ? (
            <Image source={{ uri: pub.imagenes[0] }} style={s.sheetImg} resizeMode="cover" />
          ) : (
            <View style={[s.sheetImg, s.sheetImgEmpty]}>
              <Text style={{ fontSize: 48 }}>🛍️</Text>
            </View>
          )}
          <View style={s.sheetBody}>
            <Text style={s.sheetTitle}>{pub.titulo}</Text>
            <Text style={s.sheetPrice}>${pub.precio.toLocaleString("es-AR")}</Text>
            {pub.envioDisponible && <Text style={s.sheetEnvio}>🛵 Con envío disponible</Text>}
            <Text style={s.sheetHow}>¿Cómo querés recibirlo?</Text>
            <TouchableOpacity style={[s.sheetBtn, loading && s.btnDisabled]} onPress={() => handleElegir("retiro")} disabled={loading}>
              <Text style={s.sheetBtnText}>🏪 Retiro en local</Text>
            </TouchableOpacity>
            {pub.envioDisponible && (
              <TouchableOpacity style={s.sheetBtnOutline} onPress={() => handleElegir("envio")} disabled={loading}>
                <Text style={s.sheetBtnOutlineText}>🛵 Quiero envío con cadete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CardVendo({ item, onMeInteresa, esMio }: { item: PublicacionVendo; onMeInteresa: () => void; esMio: boolean }) {
  return (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/vendo/${item.id}` as any)} activeOpacity={0.9}>
      <View>
        {item.imagenes?.[0] ? (
          <Image source={{ uri: item.imagenes[0] }} style={s.cardImg} resizeMode="cover" />
        ) : (
          <View style={[s.cardImg, s.cardImgEmpty]}>
            <Text style={{ fontSize: 48 }}>🛍️</Text>
          </View>
        )}
        {item.envioDisponible && (
          <View style={s.envioBadge}><Text style={s.envioBadgeText}>🛵 Envío</Text></View>
        )}
        {!item.stockDisponible && (
          <View style={s.sinStock}><Text style={s.sinStockText}>Sin stock</Text></View>
        )}
      </View>
      <View style={s.cardBody}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.titulo}</Text>
          <View style={s.rubroBadge}><Text style={s.rubroText}>{item.rubro}</Text></View>
        </View>
        {item.descripcion ? <Text style={s.cardDesc} numberOfLines={2}>{item.descripcion}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={s.cardPrice}>${item.precio.toLocaleString("es-AR")}</Text>
          {esMio ? (
            <View style={s.miaBadge}><Text style={s.miaText}>Tu publicación</Text></View>
          ) : (
            <TouchableOpacity
              style={[s.interesaBtn, !item.stockDisponible && s.interesaBtnDisabled]}
              onPress={onMeInteresa} disabled={!item.stockDisponible}
            >
              <Text style={[s.interesaBtnText, !item.stockDisponible && { color: "#9ca3af" }]}>💬 Me interesa</Text>
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
    publicaciones.filter((p) => p.titulo.toLowerCase().includes(busqueda.toLowerCase())),
    [publicaciones, busqueda]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={s.searchBar}>
        <View style={s.searchInput}>
          <Text style={{ color: "#9ca3af", marginRight: 8 }}>🔍</Text>
          <TextInput placeholder="Buscar productos..." value={busqueda} onChangeText={setBusqueda}
            style={{ flex: 1, fontSize: 14, color: "#111827" }} placeholderTextColor="#9ca3af" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setRubroFiltro(undefined)}
            style={[s.chip, !rubroFiltro && s.chipActive]}>
            <Text style={[s.chipText, !rubroFiltro && s.chipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {RUBROS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRubroFiltro(r === rubroFiltro ? undefined : r)}
              style={[s.chip, rubroFiltro === r && s.chipActive]}>
              <Text style={[s.chipText, rubroFiltro === r && s.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#16a34a" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardVendo item={item} esMio={item.comercioId === usuario?.id}
              onMeInteresa={() => { if (!usuario) { router.push("/login"); return; } setModalPub(item); }} />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 80 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🏪</Text>
              <Text style={{ color: "#6b7280", fontSize: 16 }}>No hay publicaciones aún</Text>
            </View>
          }
        />
      )}
      {modalPub && <ModalMeInteresa pub={modalPub} onClose={() => setModalPub(null)} />}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetImg: { width: "100%", height: 200, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetImgEmpty: { backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  sheetBody: { padding: 24 },
  sheetTitle: { fontWeight: "700", color: "#111827", fontSize: 20 },
  sheetPrice: { color: "#15803d", fontWeight: "700", fontSize: 24, marginTop: 4 },
  sheetEnvio: { fontSize: 13, color: "#2563eb", marginTop: 4 },
  sheetHow: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 20, marginBottom: 12, textAlign: "center" },
  sheetBtn: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnDisabled: { backgroundColor: "#86efac" },
  sheetBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  sheetBtnOutline: { borderWidth: 2, borderColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  sheetBtnOutlineText: { color: "#15803d", fontWeight: "700", fontSize: 16 },
  cancelBtn: { paddingVertical: 8, alignItems: "center" },
  cancelText: { color: "#9ca3af", fontSize: 14 },
  searchBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  chip: { marginRight: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "white" },
  chipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  chipTextActive: { color: "white" },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden", marginBottom: 16, marginHorizontal: 16, borderWidth: 1, borderColor: "#f3f4f6" },
  cardImg: { width: "100%", height: 180 },
  cardImgEmpty: { backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  envioBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#3b82f6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  envioBadgeText: { color: "white", fontSize: 11, fontWeight: "600" },
  sinStock: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  sinStockText: { color: "white", fontWeight: "700", fontSize: 18 },
  cardBody: { padding: 16 },
  cardTitle: { fontWeight: "600", color: "#111827", fontSize: 16, flex: 1, marginRight: 8 },
  cardDesc: { color: "#6b7280", fontSize: 14, marginBottom: 12 },
  cardPrice: { color: "#15803d", fontWeight: "700", fontSize: 20 },
  rubroBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rubroText: { color: "#15803d", fontSize: 11, fontWeight: "500" },
  miaBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  miaText: { color: "#15803d", fontSize: 12, fontWeight: "600" },
  interesaBtn: { backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  interesaBtnDisabled: { backgroundColor: "#e5e7eb" },
  interesaBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
});
