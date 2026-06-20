import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { registerEmail } from "@mercadovivo/firebase";
import { crearUsuario } from "@mercadovivo/core";
import { APP_NAME } from "@mercadovivo/config";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !telefono) {
      Alert.alert("Completá todos los campos");
      return;
    }
    setLoading(true);
    try {
      const { user } = await registerEmail(email, password);
      await crearUsuario(user.uid, { nombre, email, telefono, whatsapp: telefono, rol: "cliente" });
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Nombre completo", value: nombre, set: setNombre, placeholder: "Juan García" },
    { label: "Email", value: email, set: setEmail, placeholder: "tu@email.com", keyType: "email-address" as const, autoCapitalize: "none" as const },
    { label: "Teléfono / WhatsApp", value: telefono, set: setTelefono, placeholder: "3446123456", keyType: "phone-pad" as const },
    { label: "Contraseña", value: password, set: setPassword, placeholder: "Mínimo 6 caracteres", secure: true },
  ];

  return (
    <ScrollView style={s.root}>
      <View style={s.inner}>
        <View style={s.header}>
          <Text style={s.logo}>🛒</Text>
          <Text style={s.title}>{APP_NAME}</Text>
          <Text style={s.subtitle}>Creá tu cuenta gratis</Text>
        </View>
        <View style={s.card}>
          {fields.map(({ label, value, set, placeholder, keyType, autoCapitalize, secure }) => (
            <View key={label} style={s.fieldWrap}>
              <Text style={s.label}>{label}</Text>
              <TextInput
                style={s.input} value={value} onChangeText={set}
                placeholder={placeholder} keyboardType={keyType}
                autoCapitalize={autoCapitalize ?? "words"}
                secureTextEntry={secure} placeholderTextColor="#9ca3af"
              />
            </View>
          ))}
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.linkRow} onPress={() => router.push("/login")}>
          <Text style={s.linkText}>¿Ya tenés cuenta? <Text style={s.link}>Ingresá</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },
  inner: { paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#f3f4f6" },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#111827" },
  btn: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { backgroundColor: "#86efac" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  linkRow: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14, color: "#6b7280" },
  link: { color: "#16a34a", fontWeight: "500" },
});
