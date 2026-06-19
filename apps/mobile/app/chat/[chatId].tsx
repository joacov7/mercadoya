import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@mercadovivo/hooks";
import { useChat } from "@mercadovivo/hooks";
import { APP_WHATSAPP_DEFAULT } from "@mercadovivo/config";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { usuario } = useAuth();
  const { mensajes, loading, enviar } = useChat(chatId!, usuario?.id ?? "");
  const [texto, setTexto] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (mensajes.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    await enviar(texto);
    setTexto("");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header WA */}
      <TouchableOpacity
        className="mx-4 mt-3 mb-2 bg-green-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
        onPress={() => Linking.openURL(`https://wa.me/${APP_WHATSAPP_DEFAULT}`)}
      >
        <Text className="text-white font-semibold">Continuar por WhatsApp →</Text>
      </TouchableOpacity>

      {/* Mensajes */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          const esMio = item.remitenteId === usuario?.id;
          return (
            <View className={`flex-row ${esMio ? "justify-end" : "justify-start"}`}>
              <View
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  esMio ? "bg-green-600 rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"
                }`}
              >
                <Text className={esMio ? "text-white" : "text-gray-900"}>{item.texto}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-400 text-sm">Todavía no hay mensajes. ¡Escribí el primero!</Text>
          </View>
        }
      />

      {/* Input */}
      <View className="flex-row items-center gap-2 px-4 pb-4 pt-2 bg-white border-t border-gray-100">
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleEnviar}
          className="bg-green-600 w-11 h-11 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-xl">↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
