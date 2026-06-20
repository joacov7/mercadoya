import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { listarMisPublicacionesVendo, listarMisPublicacionesBusco, desactivarVendo, cerrarBusco } from "@mercadovivo/core";
import type { PublicacionVendo, PublicacionBusco } from "@mercadovivo/types";
import { Spinner, Button, Card, Badge, EmptyState } from "@mercadovivo/ui";

export default function MisPublicaciones() {
  const { usuario, loading } = useAuth();
  const [tab, setTab] = useState<"vendo" | "busco">("vendo");
  const [vendo, setVendo] = useState<PublicacionVendo[]>([]);
  const [busco, setBusco] = useState<PublicacionBusco[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    setLoadingData(true);
    Promise.all([
      listarMisPublicacionesVendo(usuario.id),
      listarMisPublicacionesBusco(usuario.id),
    ]).then(([v, b]) => {
      setVendo(v);
      setBusco(b);
    }).finally(() => setLoadingData(false));
  }, [usuario]);

  const handleDesactivarVendo = async (id: string) => {
    await desactivarVendo(id);
    setVendo((prev) => prev.map((p) => p.id === id ? { ...p, activo: false } : p));
  };

  const handleCerrarBusco = async (id: string) => {
    await cerrarBusco(id);
    setBusco((prev) => prev.map((p) => p.id === id ? { ...p, estado: "cerrado" as const } : p));
  };

  if (loading || loadingData) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis publicaciones</h1>
          <p className="text-gray-500 text-sm mt-1">Gestioná lo que publicaste</p>
        </div>
        <Link to="/publicar">
          <Button size="sm">+ Nueva</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("vendo")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "vendo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Vendo ({vendo.length})
        </button>
        <button
          onClick={() => setTab("busco")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "busco" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Busco ({busco.length})
        </button>
      </div>

      {tab === "vendo" && (
        <div className="flex flex-col gap-3">
          {vendo.length === 0 ? (
            <EmptyState
              title="No publicaste nada aún"
              description="Publicá un producto o servicio para que los vecinos te encuentren"
              icon="🏪"
              action={<Link to="/publicar/vendo"><Button>Publicar Vendo</Button></Link>}
            />
          ) : (
            vendo.map((p) => (
              <Card key={p.id}>
                <div className="p-4 flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🛍️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{p.titulo}</h3>
                      <Badge label={p.rubro} color="green" />
                    </div>
                    <p className="text-green-700 font-bold mt-1">${p.precio.toLocaleString("es-AR")}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.activo ? `Stock: ${p.stock}` : "Inactivo"}
                      </span>
                      {p.envioDisponible && (
                        <span className="text-xs text-gray-400">🛵 Con envío</span>
                      )}
                    </div>
                  </div>
                  {p.activo && (
                    <button
                      onClick={() => handleDesactivarVendo(p.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      Pausar
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "busco" && (
        <div className="flex flex-col gap-3">
          {busco.length === 0 ? (
            <EmptyState
              title="No publicaste ningún Busco"
              description="Publicá lo que necesitás y los comercios te van a contactar"
              icon="🔍"
              action={<Link to="/publicar/busco"><Button>Publicar Busco</Button></Link>}
            />
          ) : (
            busco.map((p) => (
              <Card key={p.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge label={p.rubro} color="amber" />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.estado === "abierto" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {p.estado === "abierto" ? "Abierto" : "Cerrado"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{p.titulo}</h3>
                      {p.descripcion && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.descripcion}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link to={`/busco/${p.id}`}>
                        <Button size="sm" variant="outline">Ver ofertas</Button>
                      </Link>
                      {p.estado === "abierto" && (
                        <button
                          onClick={() => handleCerrarBusco(p.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors text-center"
                        >
                          Cerrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
