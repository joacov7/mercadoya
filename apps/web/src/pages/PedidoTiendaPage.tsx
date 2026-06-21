import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { suscribirPedidoTienda, actualizarEstadoPedidoTienda, obtenerUsuario } from "@mercadovivo/core";
import { useAuth } from "@mercadovivo/hooks";
import type { PedidoTienda, Usuario } from "@mercadovivo/types";

const LABEL_PAGO: Record<string, string> = {
  efectivo: "💵 Efectivo",
  transferencia: "📲 Transferencia",
  debito: "💳 Débito",
  tarjeta: "💳 Tarjeta de crédito",
};

const LABEL_ENVIO: Record<string, string> = {
  retiro: "🏪 Retiro en el local",
  delivery: "🛵 Delivery",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "⏳ Pendiente de pago",
  pago: "✅ Pago confirmado",
  cancelado: "❌ Cancelado",
};

export default function PedidoTiendaPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const { usuario } = useAuth();
  const [pedido, setPedido] = useState<PedidoTienda | null>(null);
  const [comercio, setComercio] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);
  const prevEstado = useRef<string | null>(null);

  const pedidoUrl = `${window.location.origin}/pedido-tienda/${pedidoId}`;
  const esCajero = !!usuario && !!pedido && usuario.id === pedido.comercioId;

  useEffect(() => {
    if (!pedidoId) return;
    return suscribirPedidoTienda(pedidoId, (p) => {
      if (p && prevEstado.current && prevEstado.current !== p.estado) {
        if (p.estado === "pago") setNotif("✅ ¡Tu pago fue confirmado!");
        if (p.estado === "cancelado") setNotif("❌ Tu pedido fue cancelado.");
      }
      if (p) prevEstado.current = p.estado;
      setPedido(p);
    });
  }, [pedidoId]);

  useEffect(() => {
    if (!pedido) return;
    obtenerUsuario(pedido.comercioId).then(setComercio);
  }, [pedido?.comercioId]);

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 6000);
    return () => clearTimeout(t);
  }, [notif]);

  const handleMarcarPago = async () => {
    if (!pedidoId) return;
    setLoading(true);
    await actualizarEstadoPedidoTienda(pedidoId, "pago");
    setLoading(false);
  };

  const handleCancelar = async () => {
    if (!pedidoId || !confirm("¿Cancelar este pedido?")) return;
    setLoading(true);
    await actualizarEstadoPedidoTienda(pedidoId, "cancelado");
    setLoading(false);
  };

  if (!pedido) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificación de cambio de estado */}
      {notif && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto bg-white border border-green-300 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 animate-bounce-once">
          <p className="font-semibold text-gray-900 flex-1">{notif}</p>
          <button onClick={() => setNotif(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
      )}

      <div className="bg-white border-b px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Pedido #{pedidoId?.slice(-6).toUpperCase()}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Estado */}
        <div className={`rounded-xl px-4 py-3 font-semibold text-center ${ESTADO_COLOR[pedido.estado]}`}>
          {ESTADO_LABEL[pedido.estado]}
        </div>

        {/* QR — solo si pendiente */}
        {pedido.estado === "pendiente" && (
          <div className="bg-white rounded-xl border p-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 text-center">
              {esCajero ? "Escaneá el QR del cliente para confirmar el pago" : "Mostrá este QR en la caja para que confirmen tu pago"}
            </p>
            <QRCodeSVG value={pedidoUrl} size={200} />
            <p className="text-xs text-gray-400 text-center break-all">{pedidoUrl}</p>
          </div>
        )}

        {/* Resumen del pedido */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">Detalle</h2>
          {pedido.items.map((item) => (
            <div key={item.publicacionId} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.titulo} × {item.cantidad}</span>
              <span className="font-medium">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>${pedido.subtotal.toLocaleString("es-AR")}</span>
            </div>
            {pedido.costoEnvio > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span><span>${pedido.costoEnvio.toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-green-700">
              <span>Total</span><span>${pedido.total.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        {/* Info pago/envío */}
        <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Método de pago</span>
            <span className="font-medium">{LABEL_PAGO[pedido.metodoPago]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Entrega</span>
            <span className="font-medium">{LABEL_ENVIO[pedido.metodoEnvio]}</span>
          </div>
          {pedido.direccionEntrega && (
            <div className="flex justify-between">
              <span className="text-gray-500">Dirección</span>
              <span className="font-medium text-right max-w-[60%]">{pedido.direccionEntrega}</span>
            </div>
          )}
        </div>

        {/* Contacto del comercio — solo para el cliente */}
        {!esCajero && comercio && (pedido.estado === "pendiente" || pedido.estado === "pago") && (
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Contacto del comercio</p>
            <p className="text-sm text-gray-800 font-medium">{comercio.nombre}</p>
            {(comercio.whatsapp || comercio.telefono) && (
              <a
                href={`https://wa.me/${(comercio.whatsapp || comercio.telefono).replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium hover:underline"
              >
                <span>📱</span> WhatsApp {comercio.whatsapp || comercio.telefono}
              </a>
            )}
          </div>
        )}

        {/* Acciones cajero */}
        {esCajero && pedido.estado === "pendiente" && (
          <div className="space-y-2">
            <button
              onClick={handleMarcarPago}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Marcar como pago
            </button>
            <button
              onClick={handleCancelar}
              disabled={loading}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-50"
            >
              Cancelar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
