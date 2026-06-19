import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button } from "@mercadovivo/ui";
import type { PublicacionVendo } from "@mercadovivo/types";
import { useAuth } from "@mercadovivo/hooks";
import { crearChat, enviarMensaje } from "@mercadovivo/core";

interface Props {
  publicacion: PublicacionVendo;
}

interface ModalProps {
  publicacion: PublicacionVendo;
  onClose: () => void;
}

function ModalMeInteresa({ publicacion, onClose }: ModalProps) {
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
      const texto =
        modalidad === "retiro"
          ? `Hola! Me interesa "${publicacion.titulo}" — $${publicacion.precio.toLocaleString("es-AR")}. Paso a retirarlo en el local.`
          : `Hola! Me interesa "${publicacion.titulo}" — $${publicacion.precio.toLocaleString("es-AR")}. Necesito envío con cadete.`;
      await enviarMensaje(chatId, usuario.id, texto);
      navigate(`/chat/${chatId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Imagen */}
        {publicacion.imagenes?.[0] ? (
          <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-48 object-cover rounded-t-3xl" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-6xl rounded-t-3xl">
            🛍️
          </div>
        )}

        <div className="p-6 flex flex-col gap-4">
          <div>
            <Badge label={publicacion.rubro} color="green" />
            <h3 className="font-bold text-gray-900 text-lg mt-2">{publicacion.titulo}</h3>
            {publicacion.descripcion && (
              <p className="text-gray-500 text-sm mt-1">{publicacion.descripcion}</p>
            )}
            <p className="text-green-700 font-bold text-2xl mt-3">
              ${publicacion.precio.toLocaleString("es-AR")}
            </p>
          </div>

          <p className="text-sm font-medium text-gray-700 text-center">¿Cómo querés recibirlo?</p>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              loading={loading}
              onClick={() => handleElegir("retiro")}
            >
              🏪 Retiro en local
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              loading={loading}
              onClick={() => handleElegir("envio")}
            >
              🛵 Quiero envío con cadete
            </Button>
          </div>

          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 text-center mt-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardVendo({ publicacion }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card>
        {publicacion.imagenes?.[0] ? (
          <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-5xl">
            🛍️
          </div>
        )}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{publicacion.titulo}</h3>
            <Badge label={publicacion.rubro} color="green" />
          </div>
          <p className="text-gray-500 text-sm line-clamp-2">{publicacion.descripcion}</p>
          <p className="text-green-700 font-bold text-xl">
            ${publicacion.precio.toLocaleString("es-AR")}
          </p>
          <Button size="sm" onClick={() => setShowModal(true)}>
            💬 Me interesa
          </Button>
        </div>
      </Card>

      {showModal && (
        <ModalMeInteresa publicacion={publicacion} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
