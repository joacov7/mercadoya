import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { PublicacionVendo } from "@mercadovivo/types";
import { useCarrito } from "../../context/CarritoContext";

interface Props {
  publicacion: PublicacionVendo;
}

function ModalComprar({ publicacion, onClose }: { publicacion: PublicacionVendo; onClose: () => void }) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);

  const handleAgregar = () => {
    agregar(
      { publicacionId: publicacion.id, comercioId: publicacion.comercioId, titulo: publicacion.titulo, precio: publicacion.precio, imagenUrl: publicacion.imagenes?.[0] },
      cantidad,
    );
    onClose();
  };

  const max = Math.min(publicacion.stock, 99);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {publicacion.imagenes?.[0] ? (
          <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gray-50 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10L12 17M4 17l8-4" />
            </svg>
          </div>
        )}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{publicacion.rubro}</p>
            <h3 className="font-bold text-gray-900 text-xl leading-tight">{publicacion.titulo}</h3>
            {publicacion.descripcion && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{publicacion.descripcion}</p>}
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Precio</p>
              <p className="text-2xl font-bold text-gray-900">${publicacion.precio.toLocaleString("es-AR")}</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 font-bold text-lg transition-colors">−</button>
              <span className="w-5 text-center font-bold text-gray-900">{cantidad}</span>
              <button onClick={() => setCantidad((c) => Math.min(max, c + 1))} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 font-bold text-lg transition-colors">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleAgregar} className="flex-1 py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors">
              Agregar · ${(publicacion.precio * cantidad).toLocaleString("es-AR")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardVendo({ publicacion }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
        <Link to={`/vendo/${publicacion.id}`} className="block relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
          {publicacion.imagenes?.[0] ? (
            <img
              src={publicacion.imagenes[0]}
              alt={publicacion.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7" />
              </svg>
            </div>
          )}
          {!publicacion.stockDisponible && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">Sin stock</span>
            </div>
          )}
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{publicacion.rubro}</p>
          <Link to={`/vendo/${publicacion.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-green-700 transition-colors">{publicacion.titulo}</h3>
          </Link>
          <div className="flex items-center justify-between mt-auto pt-3">
            <p className="font-bold text-gray-900 text-base">${publicacion.precio.toLocaleString("es-AR")}</p>
            <button
              disabled={!publicacion.stockDisponible}
              onClick={() => setShowModal(true)}
              className="text-xs font-semibold bg-gray-900 text-white px-3.5 py-1.5 rounded-xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {showModal && <ModalComprar publicacion={publicacion} onClose={() => setShowModal(false)} />}
    </>
  );
}
