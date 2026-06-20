import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { usePublicacionesBusco, useAuth } from "@mercadovivo/hooks";
import { crearOferta } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";
import type { PublicacionBusco } from "@mercadovivo/types";

function tiempoRelativo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

function ModalOferta({ pub, onClose, onEnviada }: { pub: PublicacionBusco; onClose: () => void; onEnviada: () => void }) {
  const { usuario } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!usuario || !mensaje || !precio) return;
    setLoading(true);
    setError("");
    try {
      await crearOferta({ publicacionBuscoId: pub.id, comercioId: usuario.id, nombreComercio: usuario.nombre, mensaje, precio: Number(precio) });
      onEnviada();
      onClose();
    } catch {
      setError("No se pudo enviar la oferta. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>Hacer una oferta</Text>
          <Text style={s.sheetSub}>"{pub.titulo}"</Text>
          <Text style={s.label}>Tu propuesta</Text>
          <TextInput
            value={mensaje} onChangeText={setMensaje} placeholder="Describí qué podés ofrecer..."
            placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top"
            style={[s.input, { minHeight: 80 }]}
          />
          <Text style={s.label}>Precio ($)</Text>
          <TextInput
            value={precio} onChangeText={setPrecio} placeholder="0"
            placeholderTextColor="#9ca3af" keyboardType="numeric" style={s.input}
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[s.btn, (loading || !mensaje || !precio) && s.btnDisabled]}
            onPress={handleSubmit} disabled={loading || !mensaje || !precio}
          >
            <Text style={s.btnText}>{loading ? "Enviando..." : "Enviar oferta"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={s.cancelBtn}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CardBusco({ item, onOfrecer, ofertaEnviada, esPropia }: {
  item: PublicacionBusco; onOfrecer: () => void; ofertaEnviada: boolean; esPropia: boolean;
}) {
  return (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/busco/${item.id}` as any)} activeOpacity={0.8}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={s.buscoLabel}>Busco</Text>
          <Text style={s.cardTitle} numberOfLines={2}>{item.titulo}</Text>
        </View>
        <View style={s.rubroBadge}><Text style={s.rubroText}>{item.rubro}</Text></View>
      </View>
      {item.descripcion ? <Text style={s.cardDesc} numberOfLines={2}>{item.descripcion}</Text> : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={s.timeText}>{tiempoRelativo(item.createdAt)}</Text>
        {esPropia ? (
          <View style={s.miaBadge}><Text style={s.miaText}>Tu publicación</Text></View>
        ) : ofertaEnviada ? (
          <Text style={s.enviada}>✓ Oferta enviada</Text>
        ) : (
          <TouchableOpacity style={s.ofertaBtn} onPress={onOfrecer}>
            <Text style={s.ofertaBtnText}>Hacer oferta</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FeedBuscoScreen() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const { publicaciones, loading } = usePublicacionesBusco(rubroFiltro);
  const { usuario } = useAuth();
  const [modalPub, setModalPub] = useState<PublicacionBusco | null>(null);
  const [enviados, setEnviados] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() =>
    publicaciones
      .filter((p) => p.clienteId !== usuario?.id)
      .filter((p) => p.titulo.toLowerCase().includes(busqueda.toLowerCase())),
    [publicaciones, busqueda, usuario]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={s.searchBar}>
        <View style={s.searchInput}>
          <Text style={{ color: "#9ca3af", marginRight: 8 }}>🔍</Text>
          <TextInput placeholder="Buscar solicitudes..." value={busqueda} onChangeText={setBusqueda}
            style={{ flex: 1, fontSize: 14, color: "#111827" }} placeholderTextColor="#9ca3af" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setRubroFiltro(undefined)} style={[s.chip, !rubroFiltro && s.chipActive]}>
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
            <CardBusco item={item} esPropia={item.clienteId === usuario?.id}
              ofertaEnviada={enviados.has(item.id)}
              onOfrecer={() => { if (!usuario) { router.push("/login"); return; } setModalPub(item); }} />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 80 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={{ color: "#6b7280", fontSize: 16 }}>No hay solicitudes activas</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={s.fab} onPress={() => usuario ? router.push("/(tabs)/publicar") : router.push("/login")}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "300" }}>+</Text>
      </TouchableOpacity>

      {modalPub && (
        <ModalOferta pub={modalPub} onClose={() => setModalPub(null)}
          onEnviada={() => setEnviados((prev) => new Set([...prev, modalPub!.id]))} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetTitle: { fontWeight: "700", color: "#111827", fontSize: 18, marginBottom: 4 },
  sheetSub: { color: "#6b7280", fontSize: 14, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#111827", marginBottom: 16 },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 12 },
  btn: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  btnDisabled: { backgroundColor: "#86efac" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  cancelBtn: { paddingVertical: 8, alignItems: "center" },
  cancelText: { color: "#9ca3af", fontSize: 14 },
  searchBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchInput: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  chip: { marginRight: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "white" },
  chipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  chipTextActive: { color: "white" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  buscoLabel: { fontSize: 11, color: "#d97706", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardTitle: { fontWeight: "600", color: "#111827", fontSize: 16, marginTop: 2 },
  cardDesc: { color: "#6b7280", fontSize: 13, marginBottom: 12 },
  rubroBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rubroText: { color: "#92400e", fontSize: 11, fontWeight: "500" },
  timeText: { fontSize: 12, color: "#9ca3af" },
  miaBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  miaText: { color: "#15803d", fontSize: 12, fontWeight: "500" },
  enviada: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  ofertaBtn: { backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  ofertaBtnText: { color: "white", fontSize: 13, fontWeight: "600" },
  fab: { position: "absolute", bottom: 24, right: 24, backgroundColor: "#16a34a", width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
