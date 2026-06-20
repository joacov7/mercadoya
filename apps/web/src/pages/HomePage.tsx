import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { usePublicacionesVendo, usePublicacionesBusco } from "@mercadovivo/hooks";
import { Spinner } from "@mercadovivo/ui";
import { CardVendo } from "../components/feed/CardVendo";

export default function HomePage() {
  const { usuario } = useAuth();
  const { unreadCount, chats } = useChats(usuario?.id);
  const { publicaciones: vendo, loading: loadingVendo } = usePublicacionesVendo();
  const { publicaciones: busco, loading: loadingBusco } = usePublicacionesBusco();

  const vendoRecientes = vendo.filter((p) => p.comercioId !== usuario?.id).slice(0, 4);
  const buscoRecientes = busco.filter((p) => p.clienteId !== usuario?.id).slice(0, 3);
  const chatsRecientes = chats.slice(0, 3);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Saludo */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-6 text-white">
        <p className="text-green-200 text-sm font-medium">Bienvenido de vuelta</p>
        <h1 className="text-2xl font-bold mt-1">{usuario?.nombre?.split(" ")[0]} 👋</h1>
        <div className="flex gap-4 mt-4">
          <Link to="/publicar" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
            + Publicar
          </Link>
          <Link to="/vendo" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
            Ver Vendo
          </Link>
          <Link to="/busco" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
            Ver Busco
          </Link>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/chats" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow relative">
          <span className="text-2xl">💬</span>
          <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
          <p className="text-xs text-gray-400">Conversaciones</p>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link to="/mis-publicaciones" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-2xl">🏪</span>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400">Mis publicaciones</p>
        </Link>
        <Link to="/perfil" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-2xl">⭐</span>
          <p className="text-2xl font-bold text-gray-900">
            {usuario?.reputacion?.total ?? "—"}
          </p>
          <p className="text-xs text-gray-400">Calificaciones</p>
        </Link>
      </div>

      {/* Chats recientes con no leídos primero */}
      {chatsRecientes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Conversaciones recientes</h2>
            <Link to="/chats" className="text-sm text-green-600 font-medium">Ver todas</Link>
          </div>
          <div className="flex flex-col gap-2">
            {chatsRecientes.map((chat) => {
              const noLeido = chat.lastSenderId && chat.lastSenderId !== usuario?.id;
              return (
                <Link key={chat.id} to={`/chat/${chat.id}`}>
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-sm ${
                    noLeido ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      chat.tipo === "busco" ? "bg-amber-100" : "bg-green-100"
                    }`}>
                      {chat.tipo === "busco" ? "🔍" : "🏪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${noLeido ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                        {chat.lastMessage ?? "Sin mensajes"}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{chat.tipo}</p>
                    </div>
                    {noLeido && <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendo reciente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Últimos en Vendo</h2>
          <Link to="/vendo" className="text-sm text-green-600 font-medium">Ver todo</Link>
        </div>
        {loadingVendo ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vendoRecientes.map((p) => (
              <CardVendo key={p.id} publicacion={p} />
            ))}
          </div>
        )}
      </div>

      {/* Busco reciente */}
      {!loadingBusco && buscoRecientes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Vecinos que buscan</h2>
            <Link to="/busco" className="text-sm text-green-600 font-medium">Ver todo</Link>
          </div>
          <div className="flex flex-col gap-2">
            {buscoRecientes.map((p) => (
              <Link key={p.id} to={`/busco/${p.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔍</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.titulo}</p>
                        <p className="text-xs text-gray-400">{p.rubro}</p>
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
