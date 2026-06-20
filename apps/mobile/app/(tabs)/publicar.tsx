import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { publicarBusco, publicarVendo } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";

type Modo = "elegir" | "vendo" | "busco";

function ModoElegir({ onElegir }: { onElegir: (m: "vendo" | "busco") => void }) {
  return (
    <View style={s.elegirRoot}>
      <Text style={s.elegirTitle}>¿Qué querés publicar?</Text>
      <Text style={s.elegirSub}>Elegí el tipo de publicación</Text>
      <TouchableOpacity style={s.elegirCard} onPress={() => onElegir("vendo")}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🏪</Text>
        <Text style={s.elegirCardTitle}>Vendo</Text>
        <Text style={s.elegirCardSub}>Ofrecé un producto con precio y stock</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.elegirCard} onPress={() => onElegir("busco")}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
        <Text style={s.elegirCardTitle}>Busco</Text>
        <Text style={s.elegirCardSub}>Publicá lo que necesitás y esperá ofertas</Text>
      </TouchableOpacity>
    </View>
  );
}

function FormVendo({ onBack }: { onBack: () => void }) {
  const { usuario } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [envio, setEnvio] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePublicar = async () => {
    if (!usuario) { router.push("/login"); return; }
    if (!titulo.trim() || !rubro || !precio || !stock) {
      Alert.alert("Campos incompletos", "Completá título, rubro, precio y stock.");
      return;
    }
    setLoading(true);
    try {
      await publicarVendo({
        comercioId: usuario.id, titulo, descripcion, rubro: rubro as Rubro,
        precio: Number(precio), stock: Number(stock), imagenes: [],
        stockDisponible: Number(stock) > 0, envioDisponible: envio, activo: true,
      });
      Alert.alert("¡Publicado!", "Tu producto ya está visible en el feed.", [
        { text: "Ver Vendo", onPress: () => router.push("/(tabs)/vendo") },
      ]);
      onBack();
    } catch {
      Alert.alert("Error", "No se pudo publicar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={s.formInner}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.formTitle}>Publicar Vendo</Text>
        <Text style={s.formSub}>Ofrecé un producto o servicio</Text>

        <Text style={s.label}>Título *</Text>
        <TextInput style={s.input} value={titulo} onChangeText={setTitulo}
          placeholder='Ej: "Asado vacío 1kg"' placeholderTextColor="#9ca3af" />

        <Text style={s.label}>Descripción</Text>
        <TextInput style={[s.input, { minHeight: 80 }]} value={descripcion} onChangeText={setDescripcion}
          placeholder="Detallá tu producto..." placeholderTextColor="#9ca3af"
          multiline numberOfLines={3} textAlignVertical="top" />

        <Text style={s.label}>Rubro *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {RUBROS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRubro(r)} style={[s.chip, rubro === r && s.chipActive]}>
              <Text style={[s.chipText, rubro === r && s.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Precio ($) *</Text>
            <TextInput style={s.input} value={precio} onChangeText={setPrecio}
              placeholder="0" keyboardType="numeric" placeholderTextColor="#9ca3af" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Stock *</Text>
            <TextInput style={s.input} value={stock} onChangeText={setStock}
              placeholder="0" keyboardType="numeric" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={s.switchRow}>
          <View>
            <Text style={s.switchLabel}>🛵 Ofrezco envío con cadete</Text>
            <Text style={s.switchSub}>Los compradores podrán pedir envío</Text>
          </View>
          <Switch value={envio} onValueChange={setEnvio} trackColor={{ true: "#16a34a" }} />
        </View>

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handlePublicar} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Publicar producto</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function FormBusco({ onBack }: { onBack: () => void }) {
  const { usuario } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [loading, setLoading] = useState(false);

  const handlePublicar = async () => {
    if (!usuario) { router.push("/login"); return; }
    if (!titulo.trim() || !rubro) {
      Alert.alert("Campos incompletos", "El título y el rubro son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await publicarBusco({ clienteId: usuario.id, titulo, descripcion, rubro: rubro as Rubro, estado: "abierto" });
      Alert.alert("¡Publicado!", "Tu solicitud ya está visible para los comercios.", [
        { text: "Ver Busco", onPress: () => router.push("/(tabs)/busco") },
      ]);
      onBack();
    } catch {
      Alert.alert("Error", "No se pudo publicar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={s.formInner}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.formTitle}>Publicar Busco</Text>
        <Text style={s.formSub}>Los comercios locales te responderán</Text>

        <Text style={s.label}>¿Qué buscás? *</Text>
        <TextInput style={s.input} value={titulo} onChangeText={setTitulo}
          placeholder='Ej: "5 kg de asado vacío"' placeholderTextColor="#9ca3af" />

        <Text style={s.label}>Descripción (opcional)</Text>
        <TextInput style={[s.input, { minHeight: 80 }]} value={descripcion} onChangeText={setDescripcion}
          placeholder="Marca, cantidad, características..." placeholderTextColor="#9ca3af"
          multiline numberOfLines={3} textAlignVertical="top" />

        <Text style={s.label}>Rubro *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {RUBROS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRubro(r)} style={[s.chip, rubro === r && s.chipActive]}>
              <Text style={[s.chipText, rubro === r && s.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handlePublicar} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Publicar Busco</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function PublicarScreen() {
  const { usuario } = useAuth();
  const [modo, setModo] = useState<Modo>("elegir");

  if (!usuario) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✍️</Text>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 8, textAlign: "center" }}>
          Iniciá sesión para publicar
        </Text>
        <TouchableOpacity style={s.btn} onPress={() => router.push("/login")}>
          <Text style={s.btnText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (modo === "vendo") return <FormVendo onBack={() => setModo("elegir")} />;
  if (modo === "busco") return <FormBusco onBack={() => setModo("elegir")} />;
  return <ModoElegir onElegir={setModo} />;
}

const s = StyleSheet.create({
  elegirRoot: { flex: 1, backgroundColor: "#f9fafb", padding: 24, justifyContent: "center" },
  elegirTitle: { fontSize: 24, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 8 },
  elegirSub: { color: "#6b7280", textAlign: "center", marginBottom: 32 },
  elegirCard: { backgroundColor: "white", borderWidth: 2, borderColor: "#f3f4f6", borderRadius: 24, padding: 32, alignItems: "center", marginBottom: 16 },
  elegirCardTitle: { fontWeight: "700", color: "#111827", fontSize: 20 },
  elegirCardSub: { color: "#6b7280", fontSize: 14, textAlign: "center", marginTop: 4 },
  formInner: { padding: 24 },
  backBtn: { marginBottom: 16 },
  backText: { color: "#16a34a", fontWeight: "500" },
  formTitle: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 },
  formSub: { color: "#6b7280", fontSize: 14, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#111827", marginBottom: 16 },
  chip: { marginRight: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "white" },
  chipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  chipTextActive: { color: "white" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 16, marginBottom: 24 },
  switchLabel: { fontSize: 14, fontWeight: "500", color: "#111827" },
  switchSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  btn: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: "#86efac" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
