import React from "react";
import { Card, Badge, Button } from "@mercadovivo/ui";
import type { PublicacionVendo } from "@mercadovivo/types";
import { APP_WHATSAPP_DEFAULT } from "@mercadovivo/config";

interface Props {
  publicacion: PublicacionVendo;
  whatsapp?: string;
}

export function CardVendo({ publicacion, whatsapp }: Props) {
  const numero = whatsapp ?? APP_WHATSAPP_DEFAULT;
  const waUrl = `https://wa.me/${numero}?text=${encodeURIComponent(`Hola! Vi tu publicación en MercadoVivo: "${publicacion.titulo}". Me interesa!`)}`;

  return (
    <Card>
      {publicacion.imagenes?.[0] && (
        <img
          src={publicacion.imagenes[0]}
          alt={publicacion.titulo}
          className="w-full h-48 object-cover"
        />
      )}
      {!publicacion.imagenes?.[0] && (
        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-5xl">
          🛍️
        </div>
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{publicacion.titulo}</h3>
          <Badge label={publicacion.rubro} color="green" />
        </div>
        <p className="text-gray-500 text-sm line-clamp-2">{publicacion.descripcion}</p>
        {publicacion.precio > 0 && (
          <p className="text-green-700 font-bold text-lg">
            ${publicacion.precio.toLocaleString("es-AR")}
          </p>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(waUrl, "_blank")}
        >
          💬 Me interesa
        </Button>
      </div>
    </Card>
  );
}
