import { useState, useEffect } from "react";
import { suscribirMensajes, enviarMensaje } from "@mercadovivo/core";
import type { Mensaje } from "@mercadovivo/types";

export function useChat(chatId: string, remitenteId: string) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    const unsub = suscribirMensajes(chatId, (msgs) => {
      setMensajes(msgs);
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  const enviar = async (texto: string) => {
    if (!texto.trim()) return;
    await enviarMensaje(chatId, remitenteId, texto);
  };

  return { mensajes, loading, enviar };
}
