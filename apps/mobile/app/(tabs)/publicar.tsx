import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { publicarBusco, publicarVendo } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";

type Modo = "elegir" | "vendo" | "busco";

function ModoElegir({ onElegir }: { onElegir: (m: "vendo" | "busco") => void }) {
  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">¿Qué querés publicar?</Text>
      <Text className="text-gray-500 text-center mb-8">Elegí el tipo de publicación</Text>
      <TouchableOpacity
        className="bg-white border-2 border-gray-100 rounded-3xl p-8 items-center mb-4"
        onPress={() => onElegir("vendo")}
      >
        <Text style={{ fontSize: 40 }} className="mb-3">🏪</Text>
        <Text className="font-bold text-gray-900 text-xl">Vendo</Text>
        <Text className="text-gray-500 text-sm text-center mt-1">Ofrecé un producto con precio y stock</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-white border-2 border-gray-100 rounded-3xl p-8 items-center"
        onPress={() => onElegir("busco")}
      >
        <Text style={{ fontSize: 40 }} className="mb-3">🔍</Text>
        <Text className="font-bold text-gray-900 text-xl">Busco</Text>
        <Text className="text-gray-500 text-sm text-center mt-1">Publicá lo que necesitás y esperá ofertas</Text>
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
        comercioId: usuario.id,
        titulo,
        descripcion,
        rubro: rubro as Rubro,
        precio: Number(precio),
        stock: Number(stock),
        imagenes: [],
        stockDisponible: Number(stock) > 0,
        envioDisponible: envio,
        activo: true,
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <Text className="text-green-600 font-medium">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Publicar Vendo</Text>
        <Text className="text-gray-500 text-sm mb-6">Ofrecé un producto o servicio</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Título *</Text>
        <TextInput value={titulo} onChangeText={setTitulo} placeholder='Ej: "Asado vacío 1kg"'
          placeholderTextColor="#9ca3af" className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4" />

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Descripción</Text>
        <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Detallá tu producto..."
          placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4" style={{ minHeight: 80 }} />

        <Text className="text-sm font-medium text-gray-700 mb-2">Rubro *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {RUBROS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRubro(r)}
              className={`mr-2 px-4 py-2.5 rounded-xl border ${rubro === r ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}>
              <Text className={`text-sm font-medium ${rubro === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Precio ($) *</Text>
            <TextInput value={precio} onChangeText={setPrecio} placeholder="0" keyboardType="numeric"
              placeholderTextColor="#9ca3af" className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Stock *</Text>
            <TextInput value={stock} onChangeText={setStock} placeholder="0" keyboardType="numeric"
              placeholderTextColor="#9ca3af" className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900" />
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-6"
          onPress={() => setEnvio(!envio)}
        >
          <View>
            <Text className="text-sm font-medium text-gray-900">🛵 Ofrezco envío con cadete</Text>
            <Text className="text-xs text-gray-400 mt-0.5">Los compradores podrán pedir envío</Text>
          </View>
          <View className={`w-11 h-6 rounded-full ${envio ? "bg-green-500" : "bg-gray-300"}`}>
            <View className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${envio ? "left-6" : "left-1"}`} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePublicar} disabled={loading}
          className={`py-4 rounded-2xl items-center ${loading ? "bg-green-300" : "bg-green-600"}`}>
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Publicar producto</Text>}
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
      await publicarBusco({
        clienteId: usuario.id,
        titulo,
        descripcion,
        rubro: rubro as Rubro,
        estado: "abierto",
      });
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <Text className="text-green-600 font-medium">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Publicar Busco</Text>
        <Text className="text-gray-500 text-sm mb-6">Los comercios locales te responderán</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1.5">¿Qué buscás? *</Text>
        <TextInput value={titulo} onChangeText={setTitulo} placeholder='Ej: "5 kg de asado vacío"'
          placeholderTextColor="#9ca3af" className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4" />

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Descripción (opcional)</Text>
        <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Marca, cantidad, características..."
          placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top"
          className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4" style={{ minHeight: 80 }} />

        <Text className="text-sm font-medium text-gray-700 mb-2">Rubro *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {RUBROS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRubro(r)}
              className={`mr-2 px-4 py-2.5 rounded-xl border ${rubro === r ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}>
              <Text className={`text-sm font-medium ${rubro === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={handlePublicar} disabled={loading}
          className={`py-4 rounded-2xl items-center ${loading ? "bg-green-300" : "bg-green-600"}`}>
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Publicar Busco</Text>}
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
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontSize: 48 }} className="mb-4">✍️</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">Iniciá sesión para publicar</Text>
        <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-xl mt-4" onPress={() => router.push("/login")}>
          <Text className="text-white font-semibold">Ingresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (modo === "vendo") return <FormVendo onBack={() => setModo("elegir")} />;
  if (modo === "busco") return <FormBusco onBack={() => setModo("elegir")} />;
  return <ModoElegir onElegir={setModo} />;
}
