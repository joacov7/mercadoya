import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listarProductosTienda, obtenerConfigTienda } from "@mercadovivo/core";
import { obtenerUsuario } from "@mercadovivo/core";
import { useCarrito } from "../context/CarritoContext";
import type { PublicacionVendo, ConfigTienda, Usuario } from "@mercadovivo/types";

export default function TiendaPage() {
  const { comercioId } = useParams<{ comercioId: string }>();
  const navigate = useNavigate();
  const { agregar, items, total } = useCarrito();
  const [productos, setProductos] = useState<PublicacionVendo[]>([]);
  const [config, setConfig] = useState<ConfigTienda | null>(null);
  const [comercio, setComercio] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!comercioId) return;
    Promise.all([
      listarProductosTienda(comercioId),
      obtenerConfigTienda(comercioId),
      obtenerUsuario(comercioId),
    ]).then(([prods, cfg, usr]) => {
      setProductos(prods);
      setConfig(cfg);
      setComercio(usr);
      setLoading(false);
    });
  }, [comercioId]);

  const cantidadItem = (id: string) => items.find((i) => i.publicacionId === id)?.cantidad ?? 0;

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!config?.activo) return <div className="flex h-screen items-center justify-center text-gray-500">Esta tienda no está disponible.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{comercio?.nombre ?? "Tienda"}</h1>
        <p className="text-sm text-gray-500">{comercio?.descripcion ?? ""}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {productos.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {productos.map((p) => {
              const cant = cantidadItem(p.id);
              return (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border flex gap-4 p-4">
                  {p.imagenes?.[0] && (
                    <img src={p.imagenes[0]} alt={p.titulo} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{p.titulo}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{p.descripcion}</p>
                    <p className="text-green-700 font-bold mt-1">${p.precio.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                    {cant === 0 ? (
                      <button
                        onClick={() => agregar({ publicacionId: p.id, titulo: p.titulo, precio: p.precio, cantidad: 1, imagenUrl: p.imagenes?.[0] }, comercioId!)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Agregar
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => agregar({ publicacionId: p.id, titulo: p.titulo, precio: p.precio, cantidad: 1, imagenUrl: p.imagenes?.[0] }, comercioId!)} className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center hover:bg-green-200">+</button>
                        <span className="font-semibold w-4 text-center">{cant}</span>
                        <button onClick={() => { const i = items.find(i => i.publicacionId === p.id); if (i) agregar({...i, cantidad: -1}, comercioId!); }} className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-200">−</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <button
            onClick={() => navigate(`/checkout`)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-between px-4 hover:bg-green-700"
          >
            <span className="bg-white text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{items.reduce((s, i) => s + i.cantidad, 0)}</span>
            <span>Ver carrito</span>
            <span>${total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}
