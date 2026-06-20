import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import {
  suscribirOfertasPorBusco,
  aceptarOferta,
  rechazarOferta,
  crearChat,
  enviarMensaje,
  cerrarBusco,
} from "@mercadovivo/core";
import { db, COLECCIONES, doc, getDoc } from "@mercadovivo/firebase";
import { Spinner, Button, Badge, Card } from "@mercadovivo/ui";
import type { PublicacionBusco, OfertaComercio } from "@mercadovivo/types";

export default function DetalleBusco() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState<PublicacionBusco | null>(null);
  const [ofertas, setOfertas] = useState<OfertaComercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOferta, setLoadingOferta] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, COLECCIONES.BUSCO, id)).then((snap) => {
      if (snap.exists()) setPublicacion(snap.data() as PublicacionBusco);
      setLoading(false);
    });
    return suscribirOfertasPorBusco(id, setOfertas);
  }, [id]);

  const handleAceptar = async (oferta: OfertaComercio) => {
    if (!usuario || !publicacion) return;
    setLoadingOferta(oferta.id);
    try {
      await aceptarOferta(oferta.id);
      const chatId = await crearChat({
        clienteId: usuario.id,
        comercioId: oferta.comercioId,
        publicacionRelacionada: publicacion.id,
        tipo: "busco",
      });
      await enviarMensaje(
        chatId,
        usuario.id,
        `Hola! Acepté tu oferta de $${oferta.precio.toLocaleString("es-AR")} para "${publicacion.titulo}". ¿Cómo coordinamos?`
      );
      await cerrarBusco(publicacion.id);
      navigate(`/chat/${chatId}`);
    } finally {
      setLoadingOferta(null);
    }
  };

  const handleRechazar = async (ofertaId: string) => {
    setLoadingOferta(ofertaId);
    try {
      await rechazarOferta(ofertaId);
    } finally {
      setLoadingOferta(null);
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!publicacion) return <div className="py-20 text-center text-gray-500">Publicación no encontrada</div>;

  const esElCliente = usuario?.id === publicacion.clienteId;
  const ofertasPendientes = ofertas.filter((o) => o.estado === "pendiente");
  const ofertasAceptadas = ofertas.filter((o) => o.estado === "aceptada");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Detalle publicación */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Busco</span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{publicacion.titulo}</h1>
          </div>
          <Badge label={publicacion.rubro} color="amber" />
        </div>
        {publicacion.descripcion && (
          <p className="text-gray-600 text-sm">{publicacion.descripcion}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            publicacion.estado === "abierto" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {publicacion.estado === "abierto" ? "Abierto" : "Cerrado"}
          </span>
          <span className="text-xs text-gray-400">{ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} recibida{ofertas.length !== 1 ? "s" : ""}</span>
        </div>
      </Card>

      {/* Ofertas */}
      {esElCliente && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            Ofertas recibidas {ofertasPendientes.length > 0 && (
              <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                {ofertasPendientes.length} nueva{ofertasPendientes.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>

          {ofertas.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Todavía no recibiste ofertas. Los comercios las verán pronto.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {ofertas.map((oferta) => (
              <Card key={oferta.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      ${oferta.precio.toLocaleString("es-AR")}
                    </p>
                    {oferta.nombreComercio && (
                      <p className="text-xs text-gray-500 mt-0.5">{oferta.nombreComercio}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    oferta.estado === "pendiente" ? "bg-amber-100 text-amber-700" :
                    oferta.estado === "aceptada" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {oferta.estado === "pendiente" ? "Pendiente" :
                     oferta.estado === "aceptada" ? "Aceptada" : "Rechazada"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{oferta.mensaje}</p>
                {oferta.estado === "pendiente" && publicacion.estado === "abierto" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={loadingOferta === oferta.id}
                      onClick={() => handleAceptar(oferta)}
                    >
                      ✅ Aceptar y chatear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={loadingOferta === oferta.id}
                      onClick={() => handleRechazar(oferta.id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vista comercio: sus ofertas enviadas */}
      {!esElCliente && usuario?.rol === "comercio" && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Tus ofertas enviadas</h2>
          {ofertas.filter((o) => o.comercioId === usuario.id).length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No enviaste ofertas para esta solicitud.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {ofertas.filter((o) => o.comercioId === usuario.id).map((oferta) => (
                <Card key={oferta.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">${oferta.precio.toLocaleString("es-AR")}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      oferta.estado === "pendiente" ? "bg-amber-100 text-amber-700" :
                      oferta.estado === "aceptada" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {oferta.estado === "pendiente" ? "Esperando respuesta" :
                       oferta.estado === "aceptada" ? "¡Aceptada!" : "Rechazada"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{oferta.mensaje}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
