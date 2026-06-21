import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "@mercadovivo/hooks";
import { obtenerConfigTienda, crearPedidoTienda, obtenerUsuario } from "@mercadovivo/core";
import type { ConfigTienda, MetodoPago, MetodoEnvio, Usuario } from "@mercadovivo/types";

const LABEL_PAGO: Record<MetodoPago, string> = {
  efectivo: "💵 Efectivo",
  transferencia: "📲 Transferencia",
  debito: "💳 Débito",
  tarjeta: "💳 Tarjeta de crédito",
};

const LABEL_ENVIO: Record<MetodoEnvio, string> = {
  retiro: "🏪 Retiro en el local",
  delivery: "🛵 Delivery a domicilio",
};

interface ComercioInfo {
  config: ConfigTienda | null;
  usuario: Usuario | null;
}

export default function CheckoutPage() {
  const { items, porComercio, comerciosIds, subtotal, vaciar, cambiarCantidad, quitar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [infoComercios, setInfoComercios] = useState<Record<string, ComercioInfo>>({});
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [metodosEnvio, setMetodosEnvio] = useState<Record<string, MetodoEnvio>>({});
  const [direcciones, setDirecciones] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (comerciosIds.length === 0) { navigate("/"); return; }
    Promise.all(
      comerciosIds.map(async (cid) => {
        const [config, usr] = await Promise.all([obtenerConfigTienda(cid), obtenerUsuario(cid)]);
        return [cid, { config, usuario: usr }] as [string, ComercioInfo];
      })
    ).then((entries) => {
      const info = Object.fromEntries(entries);
      setInfoComercios(info);
      // Default: primer método de pago disponible (intersección)
      const primerConfig = entries[0]?.[1].config;
      if (primerConfig?.metodosPago?.length) setMetodoPago(primerConfig.metodosPago[0]);
      // Default envío por comercio
      const defaults: Record<string, MetodoEnvio> = {};
      for (const [cid, { config: cfg }] of entries) {
        if (cfg?.metodosEnvio?.length) defaults[cid] = cfg.metodosEnvio[0];
      }
      setMetodosEnvio(defaults);
    });
  }, [comerciosIds.join(",")]);

  if (items.length === 0) { navigate("/"); return null; }

  // Métodos de pago disponibles: intersección de todos los comercios en carrito
  const metodosDisponibles: MetodoPago[] = (() => {
    const todos = comerciosIds.map((cid) => infoComercios[cid]?.config?.metodosPago ?? []);
    if (todos.length === 0) return [];
    return todos.reduce((acc, m) => acc.filter((x) => m.includes(x)));
  })();

  const calcularTotalComercio = (cid: string) => {
    const its = porComercio[cid] ?? [];
    const sub = its.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const cfg = infoComercios[cid]?.config;
    const recargo = metodoPago && cfg?.recargosPago ? (cfg.recargosPago[metodoPago] ?? 0) : 0;
    const envio = metodosEnvio[cid] === "delivery" ? (cfg?.costoDelivery ?? 0) : 0;
    return { sub, recargo, envio, total: Math.round(sub * (1 + recargo / 100) + envio) };
  };

  const totalGeneral = comerciosIds.reduce((s, cid) => s + calcularTotalComercio(cid).total, 0);

  const handleConfirmar = async () => {
    if (!metodoPago || !usuario) return;
    for (const cid of comerciosIds) {
      const envio = metodosEnvio[cid];
      if (!envio) { alert(`Seleccioná método de entrega para todos los comercios.`); return; }
      if (envio === "delivery" && !direcciones[cid]?.trim()) {
        alert(`Ingresá una dirección de entrega para ${infoComercios[cid]?.usuario?.nombre ?? "un comercio"}.`);
        return;
      }
    }
    setLoading(true);
    try {
      const pedidoIds: string[] = [];
      for (const cid of comerciosIds) {
        const its = porComercio[cid];
        const { sub, envio, total } = calcularTotalComercio(cid);
        const pid = await crearPedidoTienda({
          comercioId: cid,
          clienteId: usuario.id,
          clienteNombre: usuario.nombre,
          clienteTelefono: usuario.telefono,
          items: its,
          metodoPago,
          metodoEnvio: metodosEnvio[cid],
          direccionEntrega: metodosEnvio[cid] === "delivery" ? direcciones[cid] : undefined,
          subtotal: sub,
          costoEnvio: envio,
          total,
          estado: "pendiente",
        });
        pedidoIds.push(pid);
      }
      vaciar();
      if (pedidoIds.length === 1) {
        navigate(`/pedido-tienda/${pedidoIds[0]}`);
      } else {
        navigate(`/mis-pedidos`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h1 className="text-xl font-bold text-gray-900">Tu carrito</h1>
        {comerciosIds.length > 1 && (
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{comerciosIds.length} comercios</span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-36">
        {/* Un bloque por comercio */}
        {comerciosIds.map((cid) => {
          const info = infoComercios[cid];
          const its = porComercio[cid] ?? [];
          const { sub, recargo, envio, total } = calcularTotalComercio(cid);
          const cfg = info?.config;

          return (
            <div key={cid} className="bg-white rounded-2xl border overflow-hidden">
              {/* Header comercio */}
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
                <span className="text-lg">🏪</span>
                <p className="font-semibold text-gray-800 text-sm">{info?.usuario?.nombre ?? "Cargando..."}</p>
              </div>

              {/* Items */}
              <div className="divide-y">
                {its.map((item) => (
                  <div key={item.publicacionId} className="flex items-center gap-3 p-4">
                    {item.imagenUrl ? (
                      <img src={item.imagenUrl} alt={item.titulo} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🛍️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{item.titulo}</p>
                      <p className="text-green-700 font-bold text-sm">${item.precio.toLocaleString("es-AR")}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => cambiarCantidad(item.publicacionId, item.cantidad - 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">−</button>
                        <span className="text-sm font-semibold w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.publicacionId, item.cantidad + 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-bold text-gray-900 text-sm">${(item.precio * item.cantidad).toLocaleString("es-AR")}</p>
                      <button onClick={() => quitar(item.publicacionId)} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Entrega */}
              {cfg && (
                <div className="px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Entrega</p>
                  <div className="flex gap-2">
                    {cfg.metodosEnvio.map((m) => (
                      <button key={m} onClick={() => setMetodosEnvio((prev) => ({ ...prev, [cid]: m }))}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${metodosEnvio[cid] === m ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>
                        {m === "retiro" ? "🏪 Retiro" : `🛵 Delivery${cfg.costoDelivery > 0 ? ` +$${cfg.costoDelivery.toLocaleString("es-AR")}` : " gratis"}`}
                      </button>
                    ))}
                  </div>
                  {metodosEnvio[cid] === "delivery" && (
                    <input value={direcciones[cid] ?? ""} onChange={(e) => setDirecciones((prev) => ({ ...prev, [cid]: e.target.value }))}
                      placeholder="Dirección de entrega"
                      className="mt-2 w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  )}
                </div>
              )}

              {/* Subtotal por comercio */}
              <div className="px-4 py-3 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Subtotal: ${sub.toLocaleString("es-AR")}</p>
                  {recargo !== 0 && <p className={recargo > 0 ? "text-red-500" : "text-green-600"}>{recargo > 0 ? `+${recargo}%` : `${recargo}%`} por método de pago</p>}
                  {envio > 0 && <p>Envío: +${envio.toLocaleString("es-AR")}</p>}
                </div>
                <p className="font-bold text-green-700">${total.toLocaleString("es-AR")}</p>
              </div>
            </div>
          );
        })}

        {/* Método de pago global */}
        {metodosDisponibles.length > 0 && (
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Método de pago</h2>
            <div className="grid grid-cols-2 gap-2">
              {metodosDisponibles.map((m) => (
                <button key={m} onClick={() => setMetodoPago(m)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${metodoPago === m ? "border-green-600 bg-green-50" : "border-gray-200"}`}>
                  <p className="text-sm font-medium">{LABEL_PAGO[m]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total general */}
        {comerciosIds.length > 1 && (
          <div className="bg-white rounded-2xl border p-4 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total general</span>
            <span className="text-2xl font-extrabold text-green-700">${totalGeneral.toLocaleString("es-AR")}</span>
          </div>
        )}
      </div>

      {/* Botón fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleConfirmar} disabled={!metodoPago || loading || comerciosIds.some((cid) => !metodosEnvio[cid])}
          className="w-full max-w-lg mx-auto block bg-green-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Procesando..." : `Confirmar ${comerciosIds.length > 1 ? `${comerciosIds.length} pedidos` : "pedido"} · $${totalGeneral.toLocaleString("es-AR")}`}
        </button>
      </div>
    </div>
  );
}
