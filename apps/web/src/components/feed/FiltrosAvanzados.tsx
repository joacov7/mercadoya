import React, { useState } from "react";

export interface Filtros {
  precioMin?: number;
  precioMax?: number;
  soloConEnvio?: boolean;
  soloConStock?: boolean;
}

interface Props {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
  cantActivos: number;
}

export function FiltrosAvanzados({ filtros, onChange, cantActivos }: Props) {
  const [abierto, setAbierto] = useState(false);

  const limpiar = () => onChange({});

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAbierto(!abierto)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            cantActivos > 0
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtros
          {cantActivos > 0 && (
            <span className="bg-white text-green-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {cantActivos}
            </span>
          )}
        </button>
        {cantActivos > 0 && (
          <button onClick={limpiar} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {abierto && (
        <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          {/* Precio */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Precio ($)</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Mínimo"
                min="0"
                value={filtros.precioMin ?? ""}
                onChange={(e) => onChange({ ...filtros, precioMin: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-400 text-sm flex-shrink-0">—</span>
              <input
                type="number"
                placeholder="Máximo"
                min="0"
                value={filtros.precioMax ?? ""}
                onChange={(e) => onChange({ ...filtros, precioMax: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">🛵 Con envío disponible</p>
                <p className="text-xs text-gray-400">Solo productos con envío a domicilio</p>
              </div>
              <div
                onClick={() => onChange({ ...filtros, soloConEnvio: !filtros.soloConEnvio })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                  filtros.soloConEnvio ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filtros.soloConEnvio ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">✅ Con stock disponible</p>
                <p className="text-xs text-gray-400">Excluir productos sin stock</p>
              </div>
              <div
                onClick={() => onChange({ ...filtros, soloConStock: !filtros.soloConStock })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                  filtros.soloConStock ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filtros.soloConStock ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </label>
          </div>

          <button
            onClick={() => setAbierto(false)}
            className="text-sm text-green-600 font-medium hover:text-green-700 text-center"
          >
            Aplicar filtros ✓
          </button>
        </div>
      )}
    </div>
  );
}
