import React, { useState, useMemo } from "react";
import { usePublicacionesVendo } from "@mercadovivo/hooks";
import { type Rubro } from "@mercadovivo/config";
import { Spinner, EmptyState } from "@mercadovivo/ui";
import { CardVendo } from "../components/feed/CardVendo";
import { FiltroRubros } from "../components/feed/FiltroRubros";
import { Buscador } from "../components/feed/Buscador";
import { Link } from "react-router-dom";

export default function FeedVendo() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const [busqueda, setBusqueda] = useState("");
  const { publicaciones, loading } = usePublicacionesVendo(rubroFiltro);

  const filtradas = useMemo(() =>
    publicaciones.filter((p) =>
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    ), [publicaciones, busqueda]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendo en Gualeguay</h1>
        <p className="text-gray-500 text-sm mt-1">Productos y servicios disponibles ahora</p>
      </div>

      <Buscador value={busqueda} onChange={setBusqueda} placeholder="Buscar productos..." />
      <FiltroRubros selected={rubroFiltro} onChange={setRubroFiltro} />

      {loading && <div className="py-12"><Spinner /></div>}

      {!loading && filtradas.length === 0 && (
        <EmptyState
          title="No hay publicaciones"
          description="Todavía no hay productos en esta categoría. ¡Volvé más tarde!"
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
