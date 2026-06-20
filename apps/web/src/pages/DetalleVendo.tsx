import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { crearChat, enviarMensaje, obtenerUsuario } from "@mercadovivo/core";
import { getDb, COLECCIONES, doc, getDoc } from "@mercadovivo/firebase";
import type { PublicacionVendo, Usuario } from "@mercadovivo/types";
import { Spinner, Button, Badge } from "@mercadovivo/ui";

export default function DetalleVendo() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pub, setPub] = useState<PublicacionVendo | null>(null);
  const [comercio, setComercio] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalidad, setModalidad] = useState<"retiro" | "envio" | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(getDb(), COLECCIONES.VENDO, id)).then(async (snap) => {
      if (!snap.exists()) { setLoading(false); return; }
      const data = snap.data() as PublicacionVendo;
      setPub(data);
      const u = await obtenerUsuario(data.comercioId);
      setComercio(u);
      setLoading(false);
    });
  }, [id]);

  const handleContactar = async () => {
    if (!usuario) { navigate("/login"); return; }
    if (!pub || !modalidad) return;
    setLoadingChat(true);
    try {
      const chatId = await crearChat({
        clienteId: usuario.id,
        comercioId: pub.comercioId,
        publicacionRelacionada: pub.id,
        tipo: "vendo",
      });
      const texto = modalidad === "retiro"
        ? `Hola! Me interesa "${pub.titulo}" — $${pub.precio.toLocaleString("es-AR")}. Paso a retirarlo en el local.`
        : `Hola! Me interesa "${pub.titulo}" — $${pub.precio.toLocaleString("es-AR")}. Necesito envío con cadete.`;
      await enviarMensaje(chatId, usuario.id, texto);
      navigate(`/chat/${chatId}`);
    } finally {
      setLoadingChat(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;
  if (!pub) return <div className="py-20 text-center text-gray-400">Publicación no encontrada</div>;

  const esPropietario = usuario?.id === pub.comercioId;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Imagen */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
        {pub.imagenes?.[0] ? (
          <img src={pub.imagenes[0]} alt={pub.titulo} className="w-full h-80 object-cover" />
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-8xl">🛍️</div>
        )}
      </div>

      {/* Info principal */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Badge label={pub.rubro} color="green" />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{pub.titulo}</h1>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-extrabold text-green-700">${pub.precio.toLocaleString("es-AR")}</p>
            <p className="text-xs text-gray-400 mt-0.5">Stock: {pub.stock}</p>
          </div>
        </div>

        {pub.descripcion && (
          <p className="text-gray-600 leading-relaxed">{pub.descripcion}</p>
        )}

        <div className="flex gap-2 flex-wrap">
          {pub.envioDisponible && (
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">🛵 Envío disponible</span>
          )}
          {!pub.stockDisponible && (
            <span className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">Sin stock</span>
          )}
        </div>

        {/* Comercio */}
        {comercio && (
          <Link to={`/comercio/${comercio.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 overflow-hidden flex-shrink-0">
              {comercio.avatarUrl
                ? <img src={comercio.avatarUrl} alt={comercio.nombre} className="w-full h-full object-cover" />
                : comercio.nombre.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{comercio.nombre}</p>
              {comercio.descripcion && <p className="text-xs text-gray-400 truncate">{comercio.descripcion}</p>}
              {comercio.reputacion && comercio.reputacion.total > 0 && (
                <p className="text-xs text-gray-400">
                  👍 {comercio.reputacion.positivos} · {comercio.reputacion.total} calificaciones
                </p>
              )}
            </div>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Acción */}
        {!esPropietario && pub.stockDisponible && (
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm font-medium text-gray-700 text-center">¿Cómo querés recibirlo?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setModalidad("retiro")}
                className={`w-full py-3 rounded-2xl border-2 text-sm font-semibold transition-colors ${
                  modalidad === "retiro" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                🏪 Retiro en local
              </button>
              {pub.envioDisponible && (
                <button
                  onClick={() => setModalidad("envio")}
                  className={`w-full py-3 rounded-2xl border-2 text-sm font-semibold transition-colors ${
                    modalidad === "envio" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  🛵 Envío con cadete
                </button>
              )}
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={!modalidad}
              loading={loadingChat}
              onClick={handleContactar}
            >
              💬 Contactar al vendedor
            </Button>
          </div>
        )}

        {esPropietario && (
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <p className="text-sm text-green-700 font-medium">Esta es tu publicación</p>
            <Link to="/mis-publicaciones" className="text-xs text-green-600 underline mt-1 inline-block">
              Ir a Mis publicaciones
            </Link>
          </div>
        )}

        {!pub.stockDisponible && !esPropietario && (
          <div className="bg-gray-50 rounded-2xl p-4 text-center text-gray-500 text-sm">
            Este producto no tiene stock disponible en este momento.
          </div>
        )}
      </div>
    </div>
  );
}
