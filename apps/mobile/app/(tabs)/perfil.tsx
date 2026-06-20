import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { logout } from "@mercadovivo/firebase";

export default function PerfilScreen() {
  const { usuario } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  if (!usuario) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={s.centerTitle}>Creá tu cuenta o ingresá</Text>
        <TouchableOpacity style={s.regBtn} onPress={() => router.push("/register")}>
          <Text style={s.regBtnText}>Registrarse gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push("/login")}>
          <Text style={s.loginLink}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={s.hero}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{usuario.nombre.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.heroName}>{usuario.nombre}</Text>
        <Text style={s.heroEmail}>{usuario.email}</Text>
        <View style={s.rolBadge}><Text style={s.rolText}>{usuario.rol}</Text></View>
      </View>

      <View style={s.content}>
        <View style={s.card}>
          <Text style={s.cardLabel}>Información</Text>
          <Row label="Teléfono" value={usuario.telefono} />
          <Row label="WhatsApp" value={usuario.whatsapp} />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  centerTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 8, textAlign: "center" },
  regBtn: { backgroundColor: "#16a34a", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 16, width: "100%", alignItems: "center" },
  regBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  loginLink: { color: "#16a34a", fontWeight: "500", fontSize: 14 },
  hero: { backgroundColor: "#16a34a", paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24, alignItems: "center" },
  avatar: { width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "white", fontWeight: "700", fontSize: 32 },
  heroName: { color: "white", fontWeight: "700", fontSize: 20 },
  heroEmail: { color: "#bbf7d0", fontSize: 14, marginTop: 2 },
  rolBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  rolText: { color: "white", fontSize: 12, fontWeight: "500", textTransform: "capitalize" },
  content: { padding: 24, gap: 16 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" },
  cardLabel: { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "500", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  rowLabel: { fontSize: 14, color: "#6b7280" },
  rowValue: { fontSize: 14, color: "#111827", fontWeight: "500" },
  logoutBtn: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 16, padding: 16, alignItems: "center" },
  logoutText: { color: "#dc2626", fontWeight: "600" },
});
