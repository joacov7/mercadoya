import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PublicacionVendo } from "@mercadovivo/types";
import { useAuth } from "@mercadovivo/hooks";
import { crearChat, enviarMensaje } from "@mercadovivo/core";

interface Props {
  publicacion: PublicacionVendo;
}

function ModalMeInteresa({ publicacion, onClose }: { publicacion: PublicacionVendo; onClose: () => void }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleElegir = async (modalidad: "retiro" | "envio") => {
    if (!usuario) { navigate("/login"); return; }
    setLoading(true);
    try {
      const chatId = await crearChat({
        clienteId: usuario.id,
        comercioId: publicacion.comercioId,
        publicacionRelacionada: publicacion.id,
        tipo: "vendo",
      });
      const texto = modalidad === "retiro"
        ? `Hola! Me interesa "${publicacion.titulo}" — $${publicacion.precio.toLocaleString("es-AR")}. Paso a retirarlo en el local.`
        : `Hola! Me interesa "${publicacion.titulo}" — $${publicacion.precio.toLocaleString("es-AR")}. Necesito envío con cadete.`;
      await enviarMensaje(chatId, usuario.id, texto);
      navigate(`/chat/${chatId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        {publicacion.imagenes?.[0] ? (
          <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-48 object-cover rounded-t-3xl" />
        ) : (
          <div className="w-full h-32 bg-green-50 flex items-center justify-center text-5xl rounded-t-3xl">🛍️</div>
        )}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">{publicacion.rubro}</p>
            <h3 className="font-bold text-gray-900 text-lg mt-1 leading-tight">{publicacion.titulo}</h3>
            {publicacion.descripcion && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{publicacion.descripcion}</p>}
            <p className="text-green-700 font-bold text-2xl mt-2">${publicacion.precio.toLocaleString("es-AR")}</p>
          </div>
          <p className="text-sm font-semibold text-gray-700 text-center">¿Cómo querés recibirlo?</p>
          <div className="flex flex-col gap-2">
            <button disabled={loading} onClick={() => handleElegir("retiro")} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
              🏪 Retiro en el local
            </button>
            {publicacion.envioDisponible && (
              <button disabled={loading} onClick={() => handleElegir("envio")} className="w-full border-2 border-green-600 text-green-700 py-3 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50">
                🛵 Quiero envío con cadete
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 text-center">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export function CardVendo({ publicacion }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
        {/* Imagen */}
        <div className="relative">
          {publicacion.imagenes?.[0] ? (
            <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-4xl">🛍️</div>
          )}
          {!publicacion.stockDisponible && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Sin stock</span>
            </div>
          )}
          {publicacion.envioDisponible && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🛵 Envío</span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">{publicacion.rubro}</p>
          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{publicacion.titulo}</p>
          <p className="text-green-700 font-bold text-lg mt-auto">${publicacion.precio.toLocaleString("es-AR")}</p>
          <button
            disabled={!publicacion.stockDisponible}
            onClick={() => setShowModal(true)}
            className="w-full mt-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>

      {showModal && <ModalMeInteresa publicacion={publicacion} onClose={() => setShowModal(false)} />}
    </>
  );
}
