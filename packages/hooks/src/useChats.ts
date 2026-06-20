import { useState, useEffect } from "react";
import { suscribirChatsUsuario } from "@mercadovivo/core";
import type { Chat } from "@mercadovivo/types";

export function useChats(userId?: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const unsub = suscribirChatsUsuario(userId, (data) => {
      setChats(data);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const unreadCount = chats.filter(
    (c) => c.lastSenderId && c.lastSenderId !== userId && c.lastMessage
  ).length;

  return { chats, loading, unreadCount };
}
