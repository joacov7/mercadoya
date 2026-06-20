import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal,
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

function ModalOferta({ pub, onClose, onEnviada }: {
  pub: PublicacionBusco;
  onClose: () => void;
  onEnviada: () => void;
}) {
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
      await crearOferta({
        publicacionBuscoId: pub.id,
        comercioId: usuario.id,
        nombreComercio: usuario.nombre,
        mensaje,
        precio: Number(precio),
      });
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
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
          <Text className="font-bold text-gray-900 text-lg mb-1">Hacer una oferta</Text>
          <Text className="text-gray-500 text-sm mb-5">"{pub.titulo}"</Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Tu propuesta</Text>
          <TextInput
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Describí qué podés ofrecer..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
            style={{ minHeight: 80 }}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Precio ($)</Text>
          <TextInput
            value={precio}
            onChangeText={setPrecio}
            placeholder="0"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
          />

          {error ? <Text className="text-red-500 text-sm mb-3">{error}</Text> : null}

          <TouchableOpacity
            className={`py-4 rounded-2xl items-center mb-3 ${loading || !mensaje || !precio ? "bg-green-300" : "bg-green-600"}`}
            onPress={handleSubmit}
            disabled={loading || !mensaje || !precio}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Enviando..." : "Enviar oferta"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="py-2 items-center">
            <Text className="text-gray-400 text-sm">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CardBusco({ item, onOfrecer, ofertaEnviada, esPropia }: {
  item: PublicacionBusco;
  onOfrecer: () => void;
  ofertaEnviada: boolean;
  esPropia: boolean;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100 shadow-sm"
      onPress={() => router.push(`/busco/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Busco</Text>
          <Text className="font-semibold text-gray-900 text-base mt-0.5" numberOfLines={2}>{item.titulo}</Text>
        </View>
        <View className="bg-amber-100 px-2 py-0.5 rounded-full">
          <Text className="text-amber-700 text-xs font-medium">{item.rubro}</Text>
        </View>
      </View>
      {item.descripcion ? (
        <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>{item.descripcion}</Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">{tiempoRelativo(item.createdAt)}</Text>
        {esPropia ? (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">Tu publicación</Text>
          </View>
        ) : ofertaEnviada ? (
          <Text className="text-xs text-green-600 font-semibold">✓ Oferta enviada</Text>
        ) : (
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-xl"
            onPress={(e) => { e.stopPropagation?.(); onOfrecer(); }}
          >
            <Text className="text-white text-sm font-semibold">Hacer oferta</Text>
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
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 mb-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            placeholder="Buscar solicitudes..."
            value={busqueda}
            onChangeText={setBusqueda}
            className="flex-1 text-sm text-gray-900"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setRubroFiltro(undefined)}
            className={`mr-2 px-4 py-2 rounded-full border ${!rubroFiltro ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
          >
            <Text className={`text-sm font-medium ${!rubroFiltro ? "text-white" : "text-gray-600"}`}>Todos</Text>
          </TouchableOpacity>
          {RUBROS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRubroFiltro(r === rubroFiltro ? undefined : r)}
              className={`mr-2 px-4 py-2 rounded-full border ${rubroFiltro === r ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-sm font-medium ${rubroFiltro === r ? "text-white" : "text-gray-600"}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" size="large" /></View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardBusco
              item={item}
              esPropia={item.clienteId === usuario?.id}
              ofertaEnviada={enviados.has(item.id)}
              onOfrecer={() => {
                if (!usuario) { router.push("/login"); return; }
                setModalPub(item);
              }}
            />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text style={{ fontSize: 48 }} className="mb-4">🔍</Text>
              <Text className="text-gray-500 text-base">No hay solicitudes activas</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => usuario ? router.push("/(tabs)/publicar") : router.push("/login")}
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>

      {modalPub && (
        <ModalOferta
          pub={modalPub}
          onClose={() => setModalPub(null)}
          onEnviada={() => setEnviados((prev) => new Set([...prev, modalPub!.id]))}
        />
      )}
    </View>
  );
}
