import { useState, useEffect, useCallback } from "react";
import { listarVendo, listarBusco } from "@mercadovivo/core";
import type { PublicacionVendo, PublicacionBusco, Rubro } from "@mercadovivo/types";

export function usePublicacionesVendo(rubro?: Rubro) {
  const [publicaciones, setPublicaciones] = useState<PublicacionVendo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarVendo(rubro);
      setPublicaciones(data);
    } catch (e) {
      console.error("Error cargando publicaciones:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [rubro]);

  useEffect(() => { cargar(); }, [cargar]);

  return { publicaciones, loading, error, refetch: cargar };
}

export function usePublicacionesBusco(rubro?: Rubro) {
  const [publicaciones, setPublicaciones] = useState<PublicacionBusco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarBusco(rubro);
      setPublicaciones(data);
    } catch (e) {
      console.error("Error cargando publicaciones:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [rubro]);

  useEffect(() => { cargar(); }, [cargar]);

  return { publicaciones, loading, error, refetch: cargar };
}
