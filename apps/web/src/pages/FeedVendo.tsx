import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicacionesVendo } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { type Rubro } from "@mercadovivo/config";
import { Spinner, EmptyState, Button } from "@mercadovivo/ui";
import { CardVendo } from "../components/feed/CardVendo";
import { FiltroRubros } from "../components/feed/FiltroRubros";
import { Buscador } from "../components/feed/Buscador";
import { FiltrosAvanzados, type Filtros } from "../components/feed/FiltrosAvanzados";

export default function FeedVendo() {
  const { usuario } = useAuth();
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<Filtros>({});
  const { publicaciones, loading } = usePublicacionesVendo(rubroFiltro);

  const filtradas = useMemo(() => {
    return publicaciones
      .filter((p) =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((p) => filtros.precioMin === undefined || p.precio >= filtros.precioMin)
      .filter((p) => filtros.precioMax === undefined || p.precio <= filtros.precioMax)
      .filter((p) => !filtros.soloConEnvio || p.envioDisponible)
      .filter((p) => !filtros.soloConStock || p.stockDisponible);
  }, [publicaciones, busqueda, filtros, usuario]);

  const cantFiltrosActivos = [
    filtros.precioMin !== undefined,
    filtros.precioMax !== undefined,
    filtros.soloConEnvio,
    filtros.soloConStock,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendo en Gualeguay</h1>
          <p className="text-gray-500 text-sm mt-1">Productos y servicios disponibles ahora</p>
        </div>
        <Link to="/publicar">
          <Button size="sm">+ Publicar</Button>
        </Link>
      </div>

      <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar productos..." />
      <FiltroRubros selected={rubroFiltro} onChange={setRubroFiltro} />
      <FiltrosAvanzados filtros={filtros} onChange={setFiltros} cantActivos={cantFiltrosActivos} />

      {loading && <div className="py-12"><Spinner /></div>}

      {!loading && filtradas.length === 0 && (
        <EmptyState
          title="No hay publicaciones"
          description="Probá cambiando los filtros o volvé más tarde"
          icon="🏪"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtradas.map((p) => (
          <CardVendo key={p.id} publicacion={p} />
        ))}
      </div>
    </div>
  );
}
