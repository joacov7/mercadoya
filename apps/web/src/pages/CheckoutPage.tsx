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
  const { items, total, comercioId, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigTienda | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvio | null>(null);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!comercioId) { navigate("/"); return; }
    obtenerConfigTienda(comercioId).then(setConfig);
  }, [comercioId]);

  if (items.length === 0) {
    navigate("/");
    return null;
  }

  const costoEnvio = metodoEnvio === "delivery" ? (config?.costoDelivery ?? 0) : 0;
  const totalFinal = total + costoEnvio;

  const handleConfirmar = async () => {
    if (!metodoPago || !metodoEnvio || !usuario || !comercioId) return;
    if (metodoEnvio === "delivery" && !direccion.trim()) { alert("Ingresá una dirección de entrega."); return; }
    setLoading(true);
    try {
      const pedidoId = await crearPedidoTienda({
        comercioId,
        clienteId: usuario.id,
        items,
        metodoPago,
        metodoEnvio,
        direccionEntrega: metodoEnvio === "delivery" ? direccion : undefined,
        subtotal: total,
        costoEnvio,
        total: totalFinal,
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
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Resumen */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Tu pedido</h2>
          {items.map((item) => (
            <div key={item.publicacionId} className="flex justify-between text-sm py-1.5 border-b last:border-0">
              <span className="text-gray-700">{item.titulo} × {item.cantidad}</span>
              <span className="font-medium">${(item.precio * item.cantidad).toLocaleString()}</span>
            </div>
          ))}
          {costoEnvio > 0 && (
            <div className="flex justify-between text-sm py-1.5 text-gray-500">
              <span>Envío</span>
              <span>${costoEnvio.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-green-700 mt-3 pt-2 border-t">
            <span>Total</span>
            <span>${totalFinal.toLocaleString()}</span>
          </div>
        </div>

        {/* Método de envío */}
        {config && (
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Método de entrega</h2>
            <div className="grid grid-cols-1 gap-2">
              {config.metodosEnvio.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoEnvio(m)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${metodoEnvio === m ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="font-medium">{LABEL_ENVIO[m]}</span>
                  {m === "delivery" && config.costoDelivery > 0 && (
                    <span className="text-sm text-gray-500 ml-2">+${config.costoDelivery.toLocaleString()}</span>
                  )}
                  {m === "delivery" && config.zonaDelivery && (
                    <p className="text-xs text-gray-400 mt-0.5">{config.zonaDelivery}</p>
                  )}
                </button>
              ))}
            </div>
            {metodoEnvio === "delivery" && (
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección de entrega"
                className="mt-3 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>
        )}

        {/* Método de pago */}
        {config && (
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Método de pago</h2>
            <div className="grid grid-cols-2 gap-2">
              {config.metodosPago.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${metodoPago === m ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-sm font-medium">{LABEL_PAGO[m]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConfirmar}
          disabled={!metodoPago || !metodoEnvio || loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
