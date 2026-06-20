import React from "react";
import { Link } from "react-router-dom";

export default function PublicarElegir() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">¿Qué querés publicar?</h1>
        <p className="text-gray-500 text-sm mt-1">Elegí el tipo de publicación</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/publicar/vendo" className="group">
          <div className="bg-white border-2 border-gray-100 hover:border-green-400 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">
              🏪
            </div>
            <div className="text-center">
              <h2 className="font-bold text-gray-900 text-lg">Vendo</h2>
              <p className="text-gray-500 text-sm mt-1">Ofrecé un producto o servicio con precio y stock</p>
            </div>
          </div>
        </Link>
        <Link to="/publicar/busco" className="group">
          <div className="bg-white border-2 border-gray-100 hover:border-amber-400 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl">
              🔍
            </div>
            <div className="text-center">
              <h2 className="font-bold text-gray-900 text-lg">Busco</h2>
              <p className="text-gray-500 text-sm mt-1">Publicá lo que necesitás y esperá ofertas de comercios</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
