import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@mercadovivo/hooks";
import { guardarConfigTienda, obtenerConfigTienda, listarMisPublicacionesVendo } from "@mercadovivo/core";
import { actualizarVendo } from "@mercadovivo/core";
import type { ConfigTienda, MetodoPago, MetodoEnvio, PublicacionVendo } from "@mercadovivo/types";
import { Navigate } from "react-router-dom";

const METODOS_PAGO: MetodoPago[] = ["efectivo", "transferencia", "debito", "tarjeta"];
const METODOS_ENVIO: MetodoEnvio[] = ["retiro", "delivery"];
const LABEL_PAGO: Record<MetodoPago, string> = {
  efectivo: "💵 Efectivo", transferencia: "📲 Transferencia",
  debito: "💳 Débito", tarjeta: "💳 Tarjeta",
};
const LABEL_ENVIO: Record<MetodoEnvio, string> = {
  retiro: "🏪 Retiro", delivery: "🛵 Delivery",
};

export default function AdminTiendaPage() {
  const { usuario } = useAuth();
  const [config, setConfig] = useState<ConfigTienda>({
    comercioId: "",
    activo: false,
    urlBase: window.location.origin,
    metodosPago: ["efectivo"],
    metodosEnvio: ["retiro"],
    costoDelivery: 0,
    zonaDelivery: "",
    updatedAt: 0,
  });
  const [productos, setProductos] = useState<PublicacionVendo[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    const cid = usuario.id;
    obtenerConfigTienda(cid).then((cfg) => {
      if (cfg) setConfig(cfg);
      else setConfig((c) => ({ ...c, comercioId: cid }));
    });
    listarMisPublicacionesVendo(cid).then(setProductos);
  }, [usuario]);

  if (!usuario) return null;
  if (usuario.rol !== "comercio" && usuario.rol !== "admin") return <Navigate to="/" replace />;

  const togglePago = (m: MetodoPago) =>
    setConfig((c) => ({
      ...c,
      metodosPago: c.metodosPago.includes(m) ? c.metodosPago.filter((x) => x !== m) : [...c.metodosPago, m],
    }));

  const toggleEnvio = (m: MetodoEnvio) =>
    setConfig((c) => ({
      ...c,
      metodosEnvio: c.metodosEnvio.includes(m) ? c.metodosEnvio.filter((x) => x !== m) : [...c.metodosEnvio, m],
    }));

  const toggleEnTienda = async (p: PublicacionVendo) => {
    await actualizarVendo(p.id, { enTienda: !p.enTienda });
    setProductos((prev) => prev.map((x) => x.id === p.id ? { ...x, enTienda: !x.enTienda } : x));
  };

  const handleGuardar = async () => {
    setSaving(true);
    await guardarConfigTienda({ ...config, comercioId: usuario.id });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const qrUrl = `${config.urlBase}/tienda/${usuario.id}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Configuración de Tienda</h1>

      {/* Activar/desactivar */}
      <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Módulo tienda</h2>
          <p className="text-sm text-gray-500">Habilitá tu tienda para recibir pedidos con QR</p>
        </div>
        <button
          onClick={() => setConfig((c) => ({ ...c, activo: !c.activo }))}
          className={`w-12 h-6 rounded-full transition-colors relative ${config.activo ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.activo ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {/* QR del local */}
      <div className="bg-white rounded-xl border p-5 flex flex-col items-center gap-4">
        <h2 className="font-semibold text-gray-800 self-start">QR del local</h2>
        <QRCodeSVG value={qrUrl} size={180} />
        <p className="text-xs text-gray-400 text-center break-all">{qrUrl}</p>
        <div className="flex items-center gap-2 w-full">
          <label className="text-sm text-gray-600 whitespace-nowrap">URL base</label>
          <input
            value={config.urlBase}
            onChange={(e) => setConfig((c) => ({ ...c, urlBase: e.target.value }))}
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Métodos de pago aceptados</h2>
        <div className="grid grid-cols-2 gap-2">
          {METODOS_PAGO.map((m) => (
            <button
              key={m}
              onClick={() => togglePago(m)}
              className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-colors ${config.metodosPago.includes(m) ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {LABEL_PAGO[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Métodos de envío */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Métodos de entrega</h2>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {METODOS_ENVIO.map((m) => (
            <button
              key={m}
              onClick={() => toggleEnvio(m)}
              className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-colors ${config.metodosEnvio.includes(m) ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {LABEL_ENVIO[m]}
            </button>
          ))}
        </div>
        {config.metodosEnvio.includes("delivery") && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap w-28">Costo envío</label>
              <input
                type="number"
                value={config.costoDelivery}
                onChange={(e) => setConfig((c) => ({ ...c, costoDelivery: Number(e.target.value) }))}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap w-28">Zona delivery</label>
              <input
                value={config.zonaDelivery}
                onChange={(e) => setConfig((c) => ({ ...c, zonaDelivery: e.target.value }))}
                placeholder="Ej: Radio 3km del centro"
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Productos en tienda */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Productos en tienda</h2>
        <p className="text-sm text-gray-500 mb-3">Activá los productos que querés mostrar en la tienda QR</p>
        {productos.length === 0 ? (
          <p className="text-gray-400 text-sm">No tenés publicaciones activas.</p>
        ) : (
          <div className="space-y-2">
            {productos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-800">{p.titulo}</p>
                  <p className="text-xs text-gray-500">${p.precio.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => toggleEnTienda(p)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${p.enTienda ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.enTienda ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleGuardar}
        disabled={saving}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {saved ? "✅ Guardado" : saving ? "Guardando..." : "Guardar configuración"}
      </button>
    </div>
  );
}
