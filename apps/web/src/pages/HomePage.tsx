import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { usePublicacionesVendo } from "@mercadovivo/hooks";
import { Spinner } from "@mercadovivo/ui";
import { CardVendo } from "../components/feed/CardVendo";
import { RUBROS } from "@mercadovivo/config";

const RUBRO_ICONS: Record<string, string> = {
  "Almacén": "🛒", "Carnicería": "🥩", "Verdulería": "🥦",
  "Ferretería": "🔧", "Veterinaria": "🐾", "Farmacia": "💊",
  "Indumentaria": "👕", "Electrónica": "📱", "Corralón": "🧱",
  "Gastronomía": "🍕", "Servicios": "🛠️", "Otros": "📦",
};

export default function HomePage() {
  const { usuario } = useAuth();
  const { publicaciones, loading } = usePublicacionesVendo();
  const recientes = publicaciones.filter((p) => p.comercioId !== usuario?.id).slice(0, 8);
  const ofertas = publicaciones.filter((p) => p.comercioId !== usuario?.id).slice(0, 4);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-green-200 text-xs font-semibold uppercase tracking-widest">Ofertas del día 🔥</p>
          <h1 className="text-2xl font-extrabold mt-1 leading-tight max-w-[200px]">
            Las mejores<br />ofertas de<br /><span className="text-amber-300">Gualeguay</span>
          </h1>
          <Link to="/vendo" className="mt-4 inline-block bg-white text-green-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
            Ver ofertas →
          </Link>
        </div>
        <div className="text-6xl opacity-80 select-none">🛍️</div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute right-12 -top-4 w-20 h-20 bg-white/10 rounded-full" />
      </div>

      {/* Categorías */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Categorías</h2>
          <Link to="/vendo" className="text-sm text-green-600 font-medium">Ver todo</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {RUBROS.slice(0, 8).map((rubro) => (
            <Link
              key={rubro}
              to={`/vendo?rubro=${encodeURIComponent(rubro)}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl hover:bg-green-100 transition-colors border border-green-100">
                {RUBRO_ICONS[rubro] ?? "📦"}
              </div>
              <span className="text-xs text-gray-600 font-medium text-center w-14 leading-tight">{rubro}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ofertas del día */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Ofertas del día 🔥</h2>
          <Link to="/vendo" className="text-sm text-green-600 font-medium">Ver todas</Link>
        </div>
        {loading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : ofertas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-10 text-center text-gray-400 text-sm">
            Todavía no hay publicaciones. <Link to="/publicar" className="text-green-600 font-medium">¡Publicá la primera!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ofertas.map((p) => <CardVendo key={p.id} publicacion={p} />)}
          </div>
        )}
      </div>

      {/* Más publicaciones */}
      {!loading && recientes.length > 4 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Nuevos productos</h2>
            <Link to="/vendo" className="text-sm text-green-600 font-medium">Ver todo</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recientes.slice(4).map((p) => <CardVendo key={p.id} publicacion={p} />)}
          </div>
        </div>
      )}

      {/* Beneficios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {[
          { icon: "🛡️", title: "Compra segura", desc: "Todos los días" },
          { icon: "🚀", title: "Entrega rápida", desc: "En Gualeguay" },
          { icon: "💬", title: "Atención por WhatsApp", desc: "Respuesta rápida" },
          { icon: "💰", title: "Precios bajos", desc: "En todos los rubros" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center text-center gap-1">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs font-semibold text-gray-800 leading-tight">{item.title}</p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
