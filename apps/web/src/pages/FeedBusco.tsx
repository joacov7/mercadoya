import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicacionesBusco } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { type Rubro } from "@mercadovivo/config";
import { Spinner, EmptyState, Button, Card, Badge } from "@mercadovivo/ui";
import { FiltroRubros } from "../components/feed/FiltroRubros";
import { crearOferta } from "@mercadovivo/core";
import type { PublicacionBusco } from "@mercadovivo/types";

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

export default function FeedBusco() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const { publicaciones, loading } = usePublicacionesBusco(rubroFiltro);
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const esComercio = usuario?.rol === "comercio";
  const [loadingOferta, setLoadingOferta] = useState<string | null>(null);

  const handleOfrecer = async (e: React.MouseEvent, pub: PublicacionBusco) => {
    e.stopPropagation();
    if (!usuario) { navigate("/login"); return; }

    const mensaje = window.prompt(`Oferta para: "${pub.titulo}"\n\nDescribí tu propuesta:`);
    if (!mensaje) return;
    const precioStr = window.prompt("¿Cuál es tu precio? (solo el número)");
    if (!precioStr) return;

    setLoadingOferta(pub.id);
    try {
      await crearOferta({
        publicacionBuscoId: pub.id,
        comercioId: usuario.id,
        nombreComercio: usuario.nombre,
        mensaje,
        precio: Number(precioStr),
      });
      alert("✅ ¡Oferta enviada! El cliente la verá en su publicación.");
    } finally {
      setLoadingOferta(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">#Busco en Gualeguay</h1>
          <p className="text-gray-500 text-sm mt-1">Lo que los vecinos necesitan hoy</p>
        </div>
        <Link to="/publicar">
          <Button size="sm">+ Publicar #Busco</Button>
        </Link>
      </div>

      <FiltroRubros selected={rubroFiltro} onChange={setRubroFiltro} />

      {loading && <div className="py-12"><Spinner /></div>}

      {!loading && publicaciones.length === 0 && (
        <EmptyState
          title="No hay solicitudes activas"
          description="Sé el primero en publicar lo que buscás"
          icon="🔍"
          action={<Link to="/publicar"><Button>Publicar ahora</Button></Link>}
        />
      )}

      <div className="flex flex-col gap-3">
        {publicaciones.map((p) => (
          <Card
            key={p.id}
            onClick={() => navigate(`/busco/${p.id}`)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">#Busco</span>
                  <h3 className="font-semibold text-gray-900 text-base leading-tight mt-0.5">{p.titulo}</h3>
                </div>
                <Badge label={p.rubro} color="amber" />
              </div>
              {p.descripcion && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.descripcion}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{tiempoRelativo(p.createdAt)}</span>
                <div className="flex gap-2">
                  {esComercio && (
                    <Button
                      size="sm"
                      loading={loadingOferta === p.id}
                      onClick={(e) => handleOfrecer(e, p)}
                    >
                      📦 Ofrecer
                    </Button>
                  )}
                  {!esComercio && usuario?.id === p.clienteId && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Tu publicación
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
