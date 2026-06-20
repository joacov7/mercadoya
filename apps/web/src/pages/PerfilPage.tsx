import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { listarChatsUsuario, obtenerCalificaciones } from "@mercadovivo/core";
import { logout } from "@mercadovivo/firebase";
import type { Chat, Calificacion } from "@mercadovivo/types";
import { Spinner, Button, Card } from "@mercadovivo/ui";

export default function PerfilPage() {
  const { usuario, loading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) return;
    listarChatsUsuario(usuario.id).then(setChats);
    obtenerCalificaciones(usuario.id).then(setCalificaciones);
  }, [usuario]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!usuario) return null;

  const positivos = calificaciones.filter((c) => c.pulgar === "positivo").length;
  const negativos = calificaciones.filter((c) => c.pulgar === "negativo").length;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Perfil */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
          {usuario.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-lg">{usuario.nombre}</h2>
          <p className="text-gray-500 text-sm">{usuario.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize">
            {usuario.rol}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>Salir</Button>
      </div>

      {/* Reputación */}
      {calificaciones.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Reputación</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👍</span>
              <div>
                <p className="text-2xl font-bold text-green-700">{positivos}</p>
                <p className="text-xs text-gray-400">Positivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👎</span>
              <div>
                <p className="text-2xl font-bold text-red-500">{negativos}</p>
                <p className="text-xs text-gray-400">Negativos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{calificaciones.length}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>

          {/* Reseñas */}
          <div className="flex flex-col gap-3">
            {calificaciones.filter((c) => c.resena).slice(0, 5).map((c) => (
              <div key={c.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <span className="text-xl">{c.pulgar === "positivo" ? "👍" : "👎"}</span>
                <p className="text-sm text-gray-700 italic">"{c.resena}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chats */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Mis conversaciones</h3>
        {chats.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No tenés conversaciones activas todavía
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chats.map((chat) => (
              <Link key={chat.id} to={`/chat/${chat.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        {chat.tipo === "busco" ? "Busco" : "Vendo"}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5 truncate max-w-xs">
                        {chat.lastMessage ?? "Sin mensajes aún"}
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
