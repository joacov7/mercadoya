import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicacionesBusco } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { type Rubro } from "@mercadovivo/config";
import { Spinner, EmptyState, Button, Card, Badge } from "@mercadovivo/ui";
import { FiltroRubros } from "../components/feed/FiltroRubros";
import { Buscador } from "../components/feed/Buscador";
import { crearOferta } from "@mercadovivo/core";
import type { PublicacionBusco } from "@mercadovivo/types";

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

interface ModalOfertaProps {
  publicacion: PublicacionBusco;
  onClose: () => void;
  onEnviada: () => void;
}

function ModalOferta({ publicacion, onClose, onEnviada }: ModalOfertaProps) {
  const { usuario } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !mensaje || !precio) return;
    setLoading(true);
    setError("");
    try {
      await crearOferta({
        publicacionBuscoId: publicacion.id,
        comercioId: usuario.id,
        nombreComercio: usuario.nombre,
        mensaje,
        precio: Number(precio),
      });
      onEnviada();
      onClose();
    } catch {
      setError("No se pudo enviar la oferta. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Hacer una oferta</h3>
          <p className="text-gray-500 text-sm mb-5">
            Solicitud: <span className="font-medium text-gray-700">"{publicacion.titulo}"</span>
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tu propuesta</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Describí qué podés ofrecer, disponibilidad, condiciones..."
                rows={3}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Precio ($)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
                min="0"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 mt-1">
              <Button type="submit" loading={loading} className="flex-1">Enviar oferta</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function FeedBusco() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const { publicaciones, loading } = usePublicacionesBusco(rubroFiltro);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [modalPub, setModalPub] = useState<PublicacionBusco | null>(null);
  const [enviados, setEnviados] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() =>
    publicaciones
      .filter((p) => usuario?.id !== p.clienteId)
      .filter((p) =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [publicaciones, busqueda, usuario]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Busco en Gualeguay</h1>
          <p className="text-gray-500 text-sm mt-1">Lo que los vecinos necesitan hoy</p>
        </div>
        <Link to="/publicar">
          <Button size="sm">+ Publicar</Button>
        </Link>
      </div>

      <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar solicitudes..." />
      <FiltroRubros selected={rubroFiltro} onChange={setRubroFiltro} />

      {loading && <div className="py-12"><Spinner /></div>}

      {!loading && filtradas.length === 0 && (
        <EmptyState
          title="No hay solicitudes activas"
          description="Sé el primero en publicar lo que buscás"
          icon="🔍"
          action={<Link to="/publicar"><Button>Publicar ahora</Button></Link>}
        />
      )}

      <div className="flex flex-col gap-3">
        {filtradas.map((p) => (
          <Card key={p.id} onClick={() => navigate(`/busco/${p.id}`)}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Busco</span>
                  <h3 className="font-semibold text-gray-900 text-base leading-tight mt-0.5">{p.titulo}</h3>
                </div>
                <Badge label={p.rubro} color="amber" />
              </div>
              {p.descripcion && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.descripcion}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{tiempoRelativo(p.createdAt)}</span>
                <div onClick={(e) => e.stopPropagation()}>
                  {usuario && !enviados.has(p.id) && (
                    <Button size="sm" onClick={() => setModalPub(p)}>
                      Hacer oferta
                    </Button>
                  )}
                  {enviados.has(p.id) && (
                    <span className="text-xs text-green-600 font-medium">✓ Oferta enviada</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {modalPub && (
        <ModalOferta
          publicacion={modalPub}
          onClose={() => setModalPub(null)}
          onEnviada={() => setEnviados((prev) => new Set([...prev, modalPub!.id]))}
        />
      )}
    </div>
  );
}
