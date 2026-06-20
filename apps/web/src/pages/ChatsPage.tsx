import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { listarChatsUsuario } from "@mercadovivo/core";
import type { Chat } from "@mercadovivo/types";
import { Spinner, Card, EmptyState } from "@mercadovivo/ui";

export default function ChatsPage() {
  const { usuario, loading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    listarChatsUsuario(usuario.id)
      .then((result) => {
        const unique = Array.from(new Map(result.map((c) => [c.id, c])).values());
        setChats(unique);
      })
      .finally(() => setLoadingChats(false));
  }, [usuario]);

  if (loading || loadingChats) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis conversaciones</h1>
        <p className="text-gray-500 text-sm mt-1">Tus chats activos con comercios y clientes</p>
      </div>

      {chats.length === 0 ? (
        <EmptyState
          title="Sin conversaciones"
          description="Todavía no tenés chats. ¡Empezá explorando productos o publicando lo que buscás!"
          icon="💬"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {chats.map((chat) => (
            <Link key={chat.id} to={`/chat/${chat.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      {chat.tipo === "busco" ? "🔍" : "🏪"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        {chat.tipo === "busco" ? "Busco" : "Vendo"}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {chat.lastMessage ?? "Sin mensajes aún"}
                      </p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
