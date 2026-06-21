import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "@mercadovivo/hooks";
import { obtenerConfigTienda, crearPedidoTienda } from "@mercadovivo/core";
import type { ConfigTienda, MetodoPago, MetodoEnvio } from "@mercadovivo/types";

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

export default function CheckoutPage() {
  const { items, subtotal, comercioId, vaciar, cambiarCantidad, quitar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigTienda | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvio | null>(null);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!comercioId) { navigate("/"); return; }
    obtenerConfigTienda(comercioId).then((cfg) => {
      setConfig(cfg);
      if (cfg?.metodosPago?.length) setMetodoPago(cfg.metodosPago[0]);
      if (cfg?.metodosEnvio?.length) setMetodoEnvio(cfg.metodosEnvio[0]);
    });
  }, [comercioId]);

  if (items.length === 0) { navigate("/"); return null; }

  const recargo = metodoPago && config?.recargosPago ? (config.recargosPago[metodoPago] ?? 0) : 0;
  const costoEnvio = metodoEnvio === "delivery" ? (config?.costoDelivery ?? 0) : 0;
  const montoConRecargo = subtotal * (1 + recargo / 100);
  const total = montoConRecargo + costoEnvio;

  const handleConfirmar = async () => {
    if (!metodoPago || !metodoEnvio || !usuario || !comercioId) return;
    if (metodoEnvio === "delivery" && !direccion.trim()) { alert("Ingresá una dirección de entrega."); return; }
    setLoading(true);
    try {
      const pedidoId = await crearPedidoTienda({
        comercioId,
        clienteId: usuario.id,
        clienteNombre: usuario.nombre,
        clienteTelefono: usuario.telefono,
        items,
        metodoPago,
        metodoEnvio,
        direccionEntrega: metodoEnvio === "delivery" ? direccion : undefined,
        subtotal,
        costoEnvio,
        total: Math.round(total),
        estado: "pendiente",
      });
      vaciar();
      navigate(`/pedido-tienda/${pedidoId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h1 className="text-xl font-bold text-gray-900">Tu carrito</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-32">
        {/* Items */}
        <div className="bg-white rounded-2xl border divide-y">
          {items.map((item) => (
            <div key={item.publicacionId} className="flex items-center gap-3 p-4">
              {item.imagenUrl ? (
                <img src={item.imagenUrl} alt={item.titulo} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🛍️</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{item.titulo}</p>
                <p className="text-green-700 font-bold mt-0.5">${item.precio.toLocaleString("es-AR")}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={() => cambiarCantidad(item.publicacionId, item.cantidad - 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-300 hover:text-red-500 font-bold">−</button>
                  <span className="text-sm font-semibold w-4 text-center">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.publicacionId, item.cantidad + 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-500 hover:text-green-600 font-bold">+</button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-gray-900">${(item.precio * item.cantidad).toLocaleString("es-AR")}</p>
                <button onClick={() => quitar(item.publicacionId)} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
              </div>
            </div>
          ))}
        </div>

        {/* Método de envío */}
        {config && (
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Entrega</h2>
            <div className="space-y-2">
              {config.metodosEnvio.map((m) => (
                <button key={m} onClick={() => setMetodoEnvio(m)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-colors ${metodoEnvio === m ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{LABEL_ENVIO[m]}</span>
                    {m === "delivery" && (
                      <span className="text-sm font-bold text-gray-700">
                        {config.costoDelivery > 0 ? `+$${config.costoDelivery.toLocaleString("es-AR")}` : "Gratis"}
                      </span>
                    )}
                    {m === "retiro" && <span className="text-sm text-green-600 font-medium">Gratis</span>}
                  </div>
                  {m === "delivery" && config.zonaDelivery && (
                    <p className="text-xs text-gray-400 mt-0.5">{config.zonaDelivery}</p>
                  )}
                </button>
              ))}
            </div>
            {metodoEnvio === "delivery" && (
              <input value={direccion} onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección de entrega"
                className="mt-3 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            )}
          </div>
        )}

        {/* Método de pago */}
        {config && (
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Método de pago</h2>
            <div className="grid grid-cols-2 gap-2">
              {config.metodosPago.map((m) => {
                const r = config.recargosPago?.[m] ?? 0;
                return (
                  <button key={m} onClick={() => setMetodoPago(m)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${metodoPago === m ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <p className="text-sm font-medium">{LABEL_PAGO[m]}</p>
                    {r !== 0 && (
                      <p className={`text-xs mt-0.5 font-semibold ${r > 0 ? "text-red-500" : "text-green-600"}`}>
                        {r > 0 ? `+${r}% recargo` : `${Math.abs(r)}% descuento`}
                      </p>
                    )}
                    {r === 0 && <p className="text-xs mt-0.5 text-gray-400">Sin recargo</p>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div className="bg-white rounded-2xl border p-4 space-y-2">
          <h2 className="font-semibold text-gray-800 mb-1">Resumen</h2>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>${subtotal.toLocaleString("es-AR")}</span>
          </div>
          {recargo !== 0 && (
            <div className={`flex justify-between text-sm ${recargo > 0 ? "text-red-500" : "text-green-600"}`}>
              <span>{recargo > 0 ? `Recargo ${metodoPago}` : `Descuento ${metodoPago}`} ({recargo > 0 ? "+" : ""}{recargo}%)</span>
              <span>{recargo > 0 ? "+" : ""}${Math.round(subtotal * recargo / 100).toLocaleString("es-AR")}</span>
            </div>
          )}
          {costoEnvio > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envío</span><span>+${costoEnvio.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-green-700 text-lg pt-2 border-t">
            <span>Total</span><span>${Math.round(total).toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Botón fijo abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button onClick={handleConfirmar} disabled={!metodoPago || !metodoEnvio || loading}
          className="w-full max-w-lg mx-auto block bg-green-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Procesando..." : `Confirmar pedido · $${Math.round(total).toLocaleString("es-AR")}`}
        </button>
      </div>
    </div>
  );
}
