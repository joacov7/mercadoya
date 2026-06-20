import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChat } from "@mercadovivo/hooks";
import {
  solicitarEnvio,
  crearPedido,
  actualizarEstadoPedido,
  suscribirPedido,
  calificarPedido,
  yaCalificó,
} from "@mercadovivo/core";
import { getDb, COLECCIONES, doc, getDoc } from "@mercadovivo/firebase";
import { Spinner, Button } from "@mercadovivo/ui";
import type { Pedido, Chat } from "@mercadovivo/types";

const ESTADOS_LABEL: Record<string, string> = {
  pendiente: "⏳ Pendiente",
  aceptado: "✅ Aceptado",
  listo: "📦 Listo / En camino",
  entregado: "🎉 Entregado",
  cancelado: "❌ Cancelado",
};

const ESTADOS_COLOR: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aceptado: "bg-blue-100 text-blue-800",
  listo: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { usuario } = useAuth();
  const { mensajes, loading, enviar } = useChat(chatId!, usuario?.id ?? "");

  const [texto, setTexto] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [showEnvio, setShowEnvio] = useState(false);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [obs, setObs] = useState("");
  const [showCalificar, setShowCalificar] = useState(false);
  const [pulgar, setPulgar] = useState<"positivo" | "negativo" | null>(null);
  const [resena, setResena] = useState("");
  const [yaCalifiqué, setYaCalifiqué] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const esComercio = !!usuario && !!chat && chat.comercioId === usuario.id;
  const primerMensaje = mensajes[0]?.texto ?? "";
  const necesitaEnvio = primerMensaje.includes("envío con cadete");

  // Cargar chat
  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(getDb(), COLECCIONES.CHATS, chatId)).then((snap) => {
      if (snap.exists()) setChat(snap.data() as Chat);
    });
  }, [chatId]);

  // Suscribir pedido en tiempo real
  useEffect(() => {
    if (!chat?.pedidoId) return;
    return suscribirPedido(chat.pedidoId, setPedido);
  }, [chat?.pedidoId]);

  // Verificar si ya calificó
  useEffect(() => {
    if (!pedido || !usuario) return;
    yaCalificó(pedido.id, usuario.id).then(setYaCalifiqué);
  }, [pedido, usuario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    await enviar(texto);
    setTexto("");
  };

  // Comercio acepta el pedido (crea el pedido si no existe)
  const handleAceptar = async () => {
    if (!usuario || !chat || !chatId) return;
    setLoadingAccion(true);
    try {
      if (!chat.pedidoId) {
        const pedidoId = await crearPedido({
          chatId,
          clienteId: chat.clienteId,
          comercioId: chat.comercioId,
          publicacionId: chat.publicacionRelacionada,
          titulo: primerMensaje.split('"')[1] ?? "Producto",
          precio: 0,
          modalidad: necesitaEnvio ? "envio" : "retiro",
          estado: "aceptado",
          calificacionCliente: false,
          calificacionComercio: false,
        });
        setChat((prev) => prev ? { ...prev, pedidoId } : prev);
        await enviar("✅ Pedido aceptado. Me estoy preparando.");
      } else {
        await actualizarEstadoPedido(chat.pedidoId, "aceptado");
        await enviar("✅ Pedido aceptado.");
      }
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleListo = async () => {
    if (!pedido) return;
    setLoadingAccion(true);
    try {
      await actualizarEstadoPedido(pedido.id, "listo");
      const msg = pedido.modalidad === "envio"
        ? "🛵 El pedido está en camino."
        : "📦 El pedido está listo para retirar en el local.";
      await enviar(msg);
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleEntregado = async () => {
    if (!pedido) return;
    setLoadingAccion(true);
    try {
      await actualizarEstadoPedido(pedido.id, "entregado");
      await enviar("🎉 Pedido entregado. ¡Gracias!");
      setShowCalificar(true);
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleSolicitarCadete = async () => {
    if (!usuario || !origen || !destino) return;
    setLoadingAccion(true);
    try {
      await solicitarEnvio({
        clienteId: usuario.id,
        comercioId: chat?.comercioId ?? "",
        origen,
        destino,
        observaciones: obs,
      });
      await enviar(`📦 Solicité un cadete. Origen: ${origen} → Destino: ${destino}${obs ? `. Nota: ${obs}` : ""}`);
      setShowEnvio(false);
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleCalificar = async () => {
    if (!pedido || !usuario || !pulgar) return;
    setLoadingAccion(true);
    try {
      const destinatarioId = esComercio ? pedido.clienteId : pedido.comercioId;
      const campo = esComercio ? "calificacionComercio" : "calificacionCliente";
      await calificarPedido(pedido.id, campo, {
        pedidoId: pedido.id,
        remitenteId: usuario.id,
        destinatarioId,
        pulgar,
        resena,
      });
      setYaCalifiqué(true);
      setShowCalificar(false);
    } finally {
      setLoadingAccion(false);
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header con estado */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Conversación</h2>
            <p className="text-xs text-gray-400">Chat privado</p>
          </div>
          {pedido && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADOS_COLOR[pedido.estado]}`}>
              {ESTADOS_LABEL[pedido.estado]}
            </span>
          )}
        </div>

        {/* Acciones según rol y estado */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {/* Comercio: aceptar */}
          {esComercio && (!pedido || pedido.estado === "pendiente") && (
            <Button size="sm" loading={loadingAccion} onClick={handleAceptar}>
              ✅ Aceptar pedido
            </Button>
          )}
          {/* Comercio: marcar listo */}
          {esComercio && pedido?.estado === "aceptado" && (
            <Button size="sm" loading={loadingAccion} onClick={handleListo}>
              {necesitaEnvio ? "🛵 Marcar en camino" : "📦 Listo para retirar"}
            </Button>
          )}
          {/* Comercio: entregado */}
          {esComercio && pedido?.estado === "listo" && (
            <Button size="sm" loading={loadingAccion} onClick={handleEntregado}>
              🎉 Marcar entregado
            </Button>
          )}
          {/* Cliente: solicitar cadete */}
          {!esComercio && necesitaEnvio && pedido?.estado === "aceptado" && (
            <Button size="sm" variant="outline" onClick={() => setShowEnvio(!showEnvio)}>
              🛵 Coordinar envío
            </Button>
          )}
          {/* Calificar */}
          {pedido?.estado === "entregado" && !yaCalifiqué && (
            <Button size="sm" variant="secondary" onClick={() => setShowCalificar(true)}>
              ⭐ Calificar
            </Button>
          )}
          {yaCalifiqué && (
            <span className="text-xs text-gray-400 self-center">✓ Ya calificaste</span>
          )}
        </div>
      </div>

      {/* Formulario cadete */}
      {showEnvio && (
        <div className="bg-amber-50 border border-amber-200 border-b-0 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-amber-800">🛵 Solicitar cadete</p>
          <input placeholder="Dirección de origen (comercio)" value={origen} onChange={(e) => setOrigen(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input placeholder="Dirección de destino (tu casa)" value={destino} onChange={(e) => setDestino(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input placeholder="Observaciones (opcional)" value={obs} onChange={(e) => setObs(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <div className="flex gap-2">
            <Button size="sm" loading={loadingAccion} onClick={handleSolicitarCadete} className="flex-1">
              Confirmar solicitud
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowEnvio(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Modal calificación */}
      {showCalificar && (
        <div className="bg-green-50 border border-green-200 border-b-0 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-green-800">⭐ Calificá tu experiencia</p>
          <div className="flex gap-3">
            <button
              onClick={() => setPulgar("positivo")}
              className={`flex-1 py-3 rounded-xl border-2 text-lg font-semibold transition-colors ${pulgar === "positivo" ? "border-green-500 bg-green-100" : "border-gray-200 bg-white"}`}
            >
              👍 Positivo
            </button>
            <button
              onClick={() => setPulgar("negativo")}
              className={`flex-1 py-3 rounded-xl border-2 text-lg font-semibold transition-colors ${pulgar === "negativo" ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
            >
              👎 Negativo
            </button>
          </div>
          <textarea
            placeholder="Escribí una reseña (opcional)..."
            value={resena}
            onChange={(e) => setResena(e.target.value)}
            rows={2}
            className="rounded-xl border border-green-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" loading={loadingAccion} onClick={handleCalificar} disabled={!pulgar} className="flex-1">
              Enviar calificación
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCalificar(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 border-b-0 p-4 flex flex-col gap-3">
        {mensajes.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">No hay mensajes aún.</div>
        )}
        {mensajes.map((m) => {
          const esMio = m.remitenteId === usuario?.id;
          return (
            <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                esMio ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
              }`}>
                {m.texto}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleEnviar} className="bg-white border border-gray-200 rounded-b-2xl p-3 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          Enviar
        </button>
      </form>
    </div>
  );
}
