import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { loginEmail } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginEmail(email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={s.inner}>
        <View style={s.header}>
          <Text style={s.logo}>🛒</Text>
          <Text style={s.title}>{APP_NAME}</Text>
          <Text style={s.subtitle}>Ingresá a tu cuenta</Text>
        </View>
        <View style={s.card}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input} value={email} onChangeText={setEmail}
            placeholder="tu@email.com" keyboardType="email-address"
            autoCapitalize="none" placeholderTextColor="#9ca3af"
          />
          <Text style={[s.label, { marginTop: 12 }]}>Contraseña</Text>
          <TextInput
            style={s.input} value={password} onChangeText={setPassword}
            placeholder="••••••••" secureTextEntry placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Ingresar</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.linkRow} onPress={() => router.push("/register")}>
          <Text style={s.linkText}>¿No tenés cuenta? <Text style={s.link}>Registrate</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  card: { backgroundColor: "white", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#f3f4f6" },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#111827" },
  btn: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  btnDisabled: { backgroundColor: "#86efac" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  linkRow: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14, color: "#6b7280" },
  link: { color: "#16a34a", fontWeight: "500" },
});
