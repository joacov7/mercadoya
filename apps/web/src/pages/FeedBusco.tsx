import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicacionesBusco } from "@mercadovivo/hooks";
import { useAuth } from "@mercadovivo/hooks";
import { type Rubro } from "@mercadovivo/config";
import { Spinner, EmptyState, Button } from "@mercadovivo/ui";
import { CardBusco } from "../components/feed/CardBusco";
import { FiltroRubros } from "../components/feed/FiltroRubros";
import { crearOferta, crearChat } from "@mercadovivo/core";
import type { PublicacionBusco } from "@mercadovivo/types";

export default function FeedBusco() {
  const [rubroFiltro, setRubroFiltro] = useState<Rubro | undefined>();
  const { publicaciones, loading } = usePublicacionesBusco(rubroFiltro);
  const { usuario } = useAuth();
  const esComercio = usuario?.rol === "comercio";

  const handleOfrecer = async (pub: PublicacionBusco) => {
    if (!usuario) return;
    const mensaje = window.prompt("¿Qué querés ofrecer? Describí brevemente tu propuesta:");
    const precioStr = window.prompt("¿Cuál es tu precio? (solo el número)");
    if (!mensaje || !precioStr) return;

    await crearOferta({
      publicacionBuscoId: pub.id,
      comercioId: usuario.id,
      mensaje,
      precio: Number(precioStr),
    });

    await crearChat({
      clienteId: pub.clienteId,
      comercioId: usuario.id,
      publicacionRelacionada: pub.id,
      tipo: "busco",
    });

    alert("¡Oferta enviada! Se abrió un chat con el cliente.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">#Busco en Gualeguay</h1>
          <p className="text-gray-500 text-sm mt-1">Lo que los vecinos necesitan hoy</p>
        </div>
        <Link to="/publicar">
          <Button size="sm">+ Publicar #Busco</Button>
        </Link>
      </div>

      <FiltroRubros selected={rubroFiltro} onChange={setRubroFiltro} />

      {loading && <div className="py-12"><Spinner /></div>}

      {!loading && publicaciones.length === 0 && (
        <EmptyState
          title="No hay solicitudes activas"
          description="Sé el primero en publicar lo que buscás"
          icon="🔍"
          action={<Link to="/publicar"><Button>Publicar ahora</Button></Link>}
        />
      )}

      <div className="flex flex-col gap-4">
        {publicaciones.map((p) => (
          <CardBusco
            key={p.id}
            publicacion={p}
            esComercio={esComercio}
            onOfrecer={handleOfrecer}
          />
        ))}
      </div>
    </div>
  );
}
