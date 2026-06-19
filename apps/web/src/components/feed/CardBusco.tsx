import React from "react";
import { Card, Badge, Button } from "@mercadovivo/ui";
import type { PublicacionBusco } from "@mercadovivo/types";

interface Props {
  publicacion: PublicacionBusco;
  onOfrecer?: (pub: PublicacionBusco) => void;
  esComercio?: boolean;
}

function tiempoRelativo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)} días`;
}

export function CardBusco({ publicacion, onOfrecer, esComercio }: Props) {
  return (
    <Card>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">#Busco</span>
            <h3 className="font-semibold text-gray-900 text-base leading-tight mt-0.5">
              {publicacion.titulo}
            </h3>
          </div>
          <Badge label={publicacion.rubro} color="amber" />
        </div>
        <p className="text-gray-500 text-sm">{publicacion.descripcion}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{tiempoRelativo(publicacion.createdAt)}</span>
          {esComercio && onOfrecer && (
            <Button size="sm" onClick={() => onOfrecer(publicacion)}>
              📦 Ofrecer producto
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
