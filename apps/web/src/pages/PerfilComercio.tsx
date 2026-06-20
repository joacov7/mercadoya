import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerUsuario, listarMisPublicacionesVendo, obtenerCalificaciones } from "@mercadovivo/core";
import type { Usuario, PublicacionVendo, Calificacion } from "@mercadovivo/types";
import { Spinner, Badge } from "@mercadovivo/ui";
import { CardVendo } from "../components/feed/CardVendo";

export default function PerfilComercio() {
  const { id } = useParams<{ id: string }>();
  const [comercio, setComercio] = useState<Usuario | null>(null);
  const [productos, setProductos] = useState<PublicacionVendo[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      obtenerUsuario(id),
      listarMisPublicacionesVendo(id),
      obtenerCalificaciones(id),
    ]).then(([u, p, c]) => {
      setComercio(u);
      setProductos(p.filter((pub) => pub.activo));
      setCalificaciones(c);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;
  if (!comercio) return <div className="py-20 text-center text-gray-400">Comercio no encontrado</div>;

  const positivos = calificaciones.filter((c) => c.pulgar === "positivo").length;
  const pct = calificaciones.length > 0 ? Math.round((positivos / calificaciones.length) * 100) : null;
  const resenas = calificaciones.filter((c) => c.resena).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header del comercio */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-green-500 to-green-700" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-3xl font-bold text-green-700">
              {comercio.avatarUrl
                ? <img src={comercio.avatarUrl} alt={comercio.nombre} className="w-full h-full object-cover" />
                : comercio.nombre.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold text-gray-900">{comercio.nombre}</h1>
              {pct !== null && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-green-700 font-semibold">{pct}% positivo</span>
                  <span className="text-xs text-gray-400">· {calificaciones.length} calificaciones</span>
                </div>
              )}
            </div>
          </div>

          {comercio.descripcion && (
            <p className="text-gray-600 text-sm">{comercio.descripcion}</p>
          )}

          {calificaciones.length > 0 && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">👍</span>
                <span className="font-bold text-green-700">{positivos}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">👎</span>
                <span className="font-bold text-red-500">{calificaciones.length - positivos}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-gray-700">{calificaciones.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas */}
      {resenas.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Lo que dicen los clientes</h2>
          <div className="flex flex-col gap-3">
            {resenas.map((c) => (
              <div key={c.id} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
                <span className="text-xl flex-shrink-0">{c.pulgar === "positivo" ? "👍" : "👎"}</span>
                <p className="text-sm text-gray-700 italic">"{c.resena}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos activos */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          Productos disponibles
          <span className="ml-2 text-sm font-normal text-gray-400">({productos.length})</span>
        </h2>
        {productos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            Este comercio no tiene productos activos en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((p) => (
              <CardVendo key={p.id} publicacion={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
