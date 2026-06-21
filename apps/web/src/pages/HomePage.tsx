import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { publicaciones, loading } = usePublicacionesVendo();
  const productos = publicaciones.slice(0, 12);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 pb-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-3">Gualeguay, Entre Ríos</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Tu mercado<br />local, online.
          </h1>
          <p className="text-gray-500 mt-3 text-base leading-relaxed max-w-sm">
            Encontrá productos de los comercios de tu ciudad. Pedí, pagá y retirá o recibilo en tu puerta.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate("/vendo")}
              className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-gray-700 transition-colors text-sm"
            >
              Ver productos
            </button>
            <Link
              to="/publicar"
              className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
            >
              Publicar
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex w-64 h-64 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl items-center justify-center flex-shrink-0">
          <span className="text-8xl select-none">🛍️</span>
        </div>
      </div>

      {/* Categorías */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categorías</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {RUBROS.map((rubro) => (
            <Link
              key={rubro}
              to={`/vendo?rubro=${encodeURIComponent(rubro)}`}
              className="flex items-center gap-2 flex-shrink-0 bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2.5 rounded-full transition-all"
            >
              <span>{RUBRO_ICONS[rubro] ?? "📦"}</span>
              <span>{rubro}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Productos disponibles</h2>
            <p className="text-sm text-gray-400 mt-0.5">Publicaciones activas en Gualeguay</p>
          </div>
          <Link to="/vendo" className="text-sm font-semibold text-green-600 hover:text-green-700">Ver todos →</Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : productos.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <p className="text-gray-400 text-sm">Todavía no hay productos.</p>
            <Link to="/publicar" className="mt-2 inline-block text-sm font-semibold text-green-600 hover:underline">Publicá el primero</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productos.map((p) => <CardVendo key={p.id} publicacion={p} />)}
          </div>
        )}
      </div>

      {/* Banner comercios */}
      {(usuario?.rol === "comercio" || usuario?.rol === "admin") ? (
        <div className="bg-gray-900 text-white rounded-3xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">Tu tienda digital</p>
            <p className="text-gray-400 text-sm mt-1">Configurá tu tienda, activá productos y compartí el QR con tus clientes.</p>
          </div>
          <Link to="/admin/tienda" className="flex-shrink-0 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            Configurar
          </Link>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">¿Tenés un comercio?</p>
            <p className="text-gray-500 text-sm mt-1">Publicá tus productos y llegá a más clientes en Gualeguay.</p>
          </div>
          <Link to="/publicar" className="flex-shrink-0 bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
            Publicar
          </Link>
        </div>
      )}
    </div>
  );
}
