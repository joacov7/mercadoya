import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { getDb, onSnapshot, collection, query, where, orderBy } from "@mercadovivo/firebase";
import type { PedidoTienda } from "@mercadovivo/types";

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const LABEL_ENVIO: Record<string, string> = {
  retiro: "🏪 Retiro", delivery: "🛵 Delivery",
};

export default function MisPedidosPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoTienda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(getDb(), "pedidos_tienda"),
      where("clienteId", "==", usuario.id),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => d.data() as PedidoTienda));
      setLoading(false);
    });
  }, [usuario]);

  if (loading) return <div className="py-16 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Mis pedidos</h1>
      {pedidos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="font-medium">Todavía no realizaste pedidos</p>
          <Link to="/vendo" className="mt-3 inline-block text-sm text-green-600 font-medium hover:underline">Ver productos →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">#{p.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[p.estado]}`}>
                  {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                </span>
              </div>
              <div className="px-4 py-3 space-y-1">
                {p.items.map((item) => (
                  <div key={item.publicacionId} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.titulo} <span className="text-gray-400">×{item.cantidad}</span></span>
                    <span className="font-medium">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{LABEL_ENVIO[p.metodoEnvio]}</p>
                  <p className="font-bold text-green-700">${p.total.toLocaleString("es-AR")}</p>
                </div>
                <Link to={`/pedido-tienda/${p.id}`} className="text-sm text-green-600 font-medium hover:underline">Ver detalle →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
