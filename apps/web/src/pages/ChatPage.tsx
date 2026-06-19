import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChat } from "@mercadovivo/hooks";
import { solicitarEnvio } from "@mercadovivo/core";
import { Spinner, Button } from "@mercadovivo/ui";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { usuario } = useAuth();
  const { mensajes, loading, enviar } = useChat(chatId!, usuario?.id ?? "");
  const [texto, setTexto] = useState("");
  const [showEnvio, setShowEnvio] = useState(false);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Detectar si el primer mensaje pidió envío con cadete
  const primerMensaje = mensajes[0]?.texto ?? "";
  const necesitaEnvio = primerMensaje.includes("envío con cadete");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    await enviar(texto);
    setTexto("");
  };

  const handleSolicitarCadete = async () => {
    if (!usuario || !origen || !destino) return;
    setEnviando(true);
    try {
      await solicitarEnvio({
        clienteId: usuario.id,
        comercioId: "",
        origen,
        destino,
        observaciones: obs,
      });
      await enviar(`📦 Solicité un cadete. Origen: ${origen} → Destino: ${destino}${obs ? `. Nota: ${obs}` : ""}`);
      setEnviado(true);
      setShowEnvio(false);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Conversación</h2>
          <p className="text-xs text-gray-400">Chat privado con el comercio</p>
        </div>
        {necesitaEnvio && !enviado && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEnvio(!showEnvio)}
          >
            🛵 Coordinar envío
          </Button>
        )}
      </div>

      {/* Formulario cadete */}
      {showEnvio && (
        <div className="bg-amber-50 border border-amber-200 border-b-0 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-amber-800">📦 Solicitar cadete</p>
          <input
            placeholder="Dirección de origen (comercio)"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            placeholder="Dirección de destino (tu casa)"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            placeholder="Observaciones (opcional)"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="rounded-xl border border-amber-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={enviando}
              onClick={handleSolicitarCadete}
              className="flex-1"
            >
              Confirmar solicitud
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEnvio(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Confirmación envío */}
      {enviado && (
        <div className="bg-green-50 border border-green-200 border-b-0 px-4 py-3 text-sm text-green-700 font-medium">
          ✅ Solicitud de cadete enviada correctamente
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 border-b-0 p-4 flex flex-col gap-3">
        {mensajes.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            No hay mensajes aún.
          </div>
        )}
        {mensajes.map((m) => {
          const esMio = m.remitenteId === usuario?.id;
          return (
            <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                esMio
                  ? "bg-green-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
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
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
