import React, { useState } from "react";
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
      { publicacionId: publicacion.id, titulo: publicacion.titulo, precio: publicacion.precio, imagenUrl: publicacion.imagenes?.[0] },
      cantidad,
      publicacion.comercioId
    );
    onClose();
  };

  const max = Math.min(publicacion.stock, 99);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        {publicacion.imagenes?.[0] ? (
          <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-44 object-cover rounded-t-3xl" />
        ) : (
          <div className="w-full h-32 bg-green-50 flex items-center justify-center text-5xl rounded-t-3xl">🛍️</div>
        )}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">{publicacion.rubro}</p>
            <h3 className="font-bold text-gray-900 text-lg mt-0.5 leading-tight">{publicacion.titulo}</h3>
            {publicacion.descripcion && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{publicacion.descripcion}</p>}
          </div>

          {/* Selector cantidad */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="text-xs text-gray-500">Precio unitario</p>
              <p className="text-green-700 font-bold text-xl">${publicacion.precio.toLocaleString("es-AR")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">−</button>
              <span className="w-6 text-center font-bold text-gray-900 text-lg">{cantidad}</span>
              <button onClick={() => setCantidad((c) => Math.min(max, c + 1))} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-gray-500">Total</span>
            <span className="font-bold text-gray-900 text-lg">${(publicacion.precio * cantidad).toLocaleString("es-AR")}</span>
          </div>

          <button onClick={handleAgregar} className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-green-700 transition-colors">
            Agregar al carrito
          </button>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 text-center">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export function CardVendo({ publicacion }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative">
          {publicacion.imagenes?.[0] ? (
            <img src={publicacion.imagenes[0]} alt={publicacion.titulo} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-4xl">🛍️</div>
          )}
          {!publicacion.stockDisponible && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Sin stock</span>
            </div>
          )}
          {publicacion.envioDisponible && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🛵 Envío</span>
          )}
        </div>

        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">{publicacion.rubro}</p>
          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{publicacion.titulo}</p>
          <p className="text-green-700 font-bold text-lg mt-auto">${publicacion.precio.toLocaleString("es-AR")}</p>
          <button
            disabled={!publicacion.stockDisponible}
            onClick={() => setShowModal(true)}
            className="w-full mt-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Comprar
          </button>
        </div>
      </div>

      {showModal && <ModalComprar publicacion={publicacion} onClose={() => setShowModal(false)} />}
    </>
  );
}
