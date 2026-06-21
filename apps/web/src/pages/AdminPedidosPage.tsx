import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { listarPedidosTiendaComercio, actualizarEstadoPedidoTienda } from "@mercadovivo/core";
import { getDb, onSnapshot, collection, query, where, orderBy } from "@mercadovivo/firebase";
import type { PedidoTienda, EstadoPedidoTienda } from "@mercadovivo/types";
import { Navigate } from "react-router-dom";

const LABEL_PAGO: Record<string, string> = {
  efectivo: "💵 Efectivo", transferencia: "📲 Transferencia",
  debito: "💳 Débito", tarjeta: "💳 Tarjeta",
};
const LABEL_ENVIO: Record<string, string> = {
  retiro: "🏪 Retiro", delivery: "🛵 Delivery",
};
const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pago: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminPedidosPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoTienda[]>([]);
  const [filtro, setFiltro] = useState<EstadoPedidoTienda | "todos">("pendiente");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const prevCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(getDb(), "pedidos_tienda"),
      where("comercioId", "==", usuario.id),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      const nuevos = snap.docs.map((d) => d.data() as PedidoTienda);
      const pendientesNuevos = nuevos.filter((p) => p.estado === "pendiente").length;
      if (prevCount.current > 0 && pendientesNuevos > prevCount.current) {
        audioRef.current?.play().catch(() => {});
      }
      prevCount.current = pendientesNuevos;
      setPedidos(nuevos);
    });
  }, [usuario]);

  if (!usuario) return null;
  if (usuario.rol !== "comercio" && usuario.rol !== "admin") return <Navigate to="/" replace />;

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
  const pendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  const marcarPago = async (id: string) => {
    setLoading((l) => ({ ...l, [id]: true }));
    await actualizarEstadoPedidoTienda(id, "pago");
    setLoading((l) => ({ ...l, [id]: false }));
  };

  const cancelar = async (id: string) => {
    if (!confirm("¿Cancelar este pedido?")) return;
    setLoading((l) => ({ ...l, [id]: true }));
    await actualizarEstadoPedidoTienda(id, "cancelado");
    setLoading((l) => ({ ...l, [id]: false }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-09.mp3" preload="auto" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          {pendientes > 0 && (
            <p className="text-sm text-yellow-600 font-medium mt-0.5">🔔 {pendientes} pendiente{pendientes > 1 ? "s" : ""}</p>
          )}
        </div>
        <Link to="/admin/tienda" className="text-sm text-green-600 font-medium hover:underline">⚙️ Config tienda</Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["pendiente", "pago", "cancelado", "todos"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filtro === f ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pendiente" && pendientes > 0 && <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendientes}</span>}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No hay pedidos {filtro !== "todos" ? filtro + "s" : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${p.estado === "pendiente" ? "border-yellow-300 shadow-md" : "border-gray-100"}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">#{p.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ESTADO_COLOR[p.estado]}`}>
                  {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                </span>
              </div>

              {/* Items */}
              <div className="px-4 py-3 space-y-1">
                {p.items.map((item) => (
                  <div key={item.publicacionId} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.titulo} <span className="text-gray-400">×{item.cantidad}</span></span>
                    <span className="font-medium">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-500">{LABEL_PAGO[p.metodoPago]} · {LABEL_ENVIO[p.metodoEnvio]}</p>
                  {p.direccionEntrega && <p className="text-xs text-gray-400">📍 {p.direccionEntrega}</p>}
                  <p className="font-bold text-green-700">${p.total.toLocaleString("es-AR")}</p>
                </div>
                {p.estado === "pendiente" && (
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => marcarPago(p.id)} disabled={loading[p.id]}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                      ✅ Cobrado
                    </button>
                    <button onClick={() => cancelar(p.id)} disabled={loading[p.id]}
                      className="bg-red-50 text-red-500 px-4 py-1.5 rounded-xl text-xs font-medium hover:bg-red-100 disabled:opacity-50">
                      Cancelar
                    </button>
                  </div>
                )}
                {p.estado === "pago" && (
                  <Link to={`/pedido-tienda/${p.id}`} className="text-sm text-green-600 font-medium hover:underline">Ver QR →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
