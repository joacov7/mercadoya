import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { Spinner, Card, EmptyState } from "@mercadovivo/ui";

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 2) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

export default function ChatsPage() {
  const { usuario, loading } = useAuth();
  const { chats, loading: loadingChats } = useChats(usuario?.id);

  if (loading || loadingChats) return <div className="py-20 flex justify-center"><Spinner /></div>;

  const tieneNoLeidos = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    return chat?.lastSenderId && chat.lastSenderId !== usuario?.id;
  };

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
        <div className="flex flex-col gap-2">
          {chats.map((chat) => {
            const noLeido = tieneNoLeidos(chat.id);
            return (
              <Link key={chat.id} to={`/chat/${chat.id}`}>
                <div className={`rounded-2xl border p-4 hover:shadow-md transition-all cursor-pointer ${
                  noLeido ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                      chat.tipo === "busco" ? "bg-amber-100" : "bg-green-100"
                    }`}>
                      {chat.tipo === "busco" ? "🔍" : "🏪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {chat.tipo === "busco" ? "Busco" : "Vendo"}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{tiempoRelativo(chat.updatedAt)}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${noLeido ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                        {chat.lastMessage ?? "Sin mensajes aún"}
                      </p>
                    </div>
                    {noLeido && (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
