import React from "react";
import { RUBROS, type Rubro } from "@mercadovivo/config";

interface Props {
  selected?: Rubro;
  onChange: (rubro?: Rubro) => void;
}

export function FiltroRubros({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(undefined)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          !selected ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
        }`}
      >
        Todos
      </button>
      {RUBROS.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r === selected ? undefined : r)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            selected === r ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
