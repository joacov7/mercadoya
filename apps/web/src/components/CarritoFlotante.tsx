import React from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

export default function CarritoFlotante() {
  const { totalItems, subtotal } = useCarrito();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto">
      <button
        onClick={() => navigate("/checkout")}
        className="w-full bg-green-600 text-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center justify-between hover:bg-green-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="bg-white text-green-700 font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
          <span className="font-semibold">Ver carrito</span>
        </div>
        <span className="font-bold text-lg">${subtotal.toLocaleString("es-AR")}</span>
      </button>
    </div>
  );
}
