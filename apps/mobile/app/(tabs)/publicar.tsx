import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { publicarBusco } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";

export default function PublicarScreen() {
  const { usuario } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [loading, setLoading] = useState(false);

  const handlePublicar = async () => {
    if (!usuario) { router.push("/login"); return; }
    if (!titulo.trim() || !rubro) {
      Alert.alert("Completá los campos", "El título y el rubro son obligatorios.");
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
        { text: "Ver #Busco", onPress: () => router.push("/(tabs)/busco") },
      ]);
      setTitulo("");
      setDescripcion("");
      setRubro("");
    } catch {
      Alert.alert("Error", "No se pudo publicar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Publicar #Busco</Text>
        <Text className="text-gray-500 text-sm mb-6">Los comercios locales te responderán</Text>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">¿Qué buscás? *</Text>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder='Ej: "5 kg de asado vacío"'
            placeholderTextColor="#9ca3af"
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Descripción (opcional)</Text>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Marca preferida, cantidad, características..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 h-24"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Rubro *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {RUBROS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRubro(r)}
                className={`mr-2 px-4 py-2.5 rounded-xl border ${rubro === r ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-sm font-medium ${rubro === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={handlePublicar}
          disabled={loading}
          className={`py-4 rounded-2xl items-center ${loading ? "bg-green-300" : "bg-green-600"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Publicar #Busco</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
