import React, { useEffect, useState } from "react";
import { Badge, Button } from "@mercadovivo/ui";
import type { PublicacionBusco } from "@mercadovivo/types";
import { listarOfertasPorBusco } from "@mercadovivo/core";

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

interface Props {
  publicacion: PublicacionBusco;
  onClick: () => void;
  onOferta?: () => void;
  ofertaEnviada?: boolean;
  mostrarBotonOferta?: boolean;
}

export function CardBusco({ publicacion, onClick, onOferta, ofertaEnviada, mostrarBotonOferta }: Props) {
  const [cantOfertas, setCantOfertas] = useState<number | null>(null);

  useEffect(() => {
    listarOfertasPorBusco(publicacion.id).then((o) => setCantOfertas(o.length));
  }, [publicacion.id]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Busco</span>
          <h3 className="font-semibold text-gray-900 text-base leading-tight mt-0.5 truncate">{publicacion.titulo}</h3>
        </div>
        <Badge label={publicacion.rubro} color="amber" />
      </div>

      {publicacion.descripcion && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{publicacion.descripcion}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{tiempoRelativo(publicacion.createdAt)}</span>
          {cantOfertas !== null && cantOfertas > 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {cantOfertas} {cantOfertas === 1 ? "oferta" : "ofertas"}
            </span>
          )}
          {cantOfertas === 0 && (
            <span className="text-xs text-gray-300">Sin ofertas aún</span>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          {mostrarBotonOferta && !ofertaEnviada && (
            <Button size="sm" onClick={onOferta}>Hacer oferta</Button>
          )}
          {ofertaEnviada && (
            <span className="text-xs text-green-600 font-medium">✓ Enviada</span>
          )}
        </div>
      </div>
    </div>
  );
}
