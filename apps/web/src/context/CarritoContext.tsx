import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ItemCarrito } from "@mercadovivo/types";

interface CarritoCtx {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad: number) => void;
  quitar: (publicacionId: string) => void;
  cambiarCantidad: (publicacionId: string, cantidad: number) => void;
  vaciar: () => void;
  subtotal: number;
  totalItems: number;
  porComercio: Record<string, ItemCarrito[]>;
  comerciosIds: string[];
}

const Ctx = createContext<CarritoCtx | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregar = useCallback((item: Omit<ItemCarrito, "cantidad">, cantidad: number) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.publicacionId === item.publicacionId);
      if (existe) return prev.map((i) => i.publicacionId === item.publicacionId ? { ...i, cantidad: i.cantidad + cantidad } : i);
      return [...prev, { ...item, cantidad }];
    });
  }, []);

  const quitar = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.publicacionId !== id));
  }, []);

  const cambiarCantidad = useCallback((id: string, cantidad: number) => {
    if (cantidad <= 0) { quitar(id); return; }
    setItems((prev) => prev.map((i) => i.publicacionId === id ? { ...i, cantidad } : i));
  }, [quitar]);

  const vaciar = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  const porComercio = useMemo(() => {
    return items.reduce<Record<string, ItemCarrito[]>>((acc, item) => {
      if (!acc[item.comercioId]) acc[item.comercioId] = [];
      acc[item.comercioId].push(item);
      return acc;
    }, {});
  }, [items]);

  const comerciosIds = useMemo(() => Object.keys(porComercio), [porComercio]);

  return (
    <Ctx.Provider value={{ items, agregar, quitar, cambiarCantidad, vaciar, subtotal, totalItems, porComercio, comerciosIds }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrito must be inside CarritoProvider");
  return ctx;
}
