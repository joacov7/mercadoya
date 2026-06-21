import React, { createContext, useContext, useState, useCallback } from "react";
import type { ItemCarrito } from "@mercadovivo/types";

interface CarritoCtx {
  items: ItemCarrito[];
  comercioId: string | null;
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad: number, comercioId: string) => void;
  quitar: (publicacionId: string) => void;
  cambiarCantidad: (publicacionId: string, cantidad: number) => void;
  vaciar: () => void;
  subtotal: number;
  totalItems: number;
}

const Ctx = createContext<CarritoCtx | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [comercioId, setComercioId] = useState<string | null>(null);

  const agregar = useCallback((item: Omit<ItemCarrito, "cantidad">, cantidad: number, cid: string) => {
    if (comercioId && comercioId !== cid) {
      if (!confirm("Tenés productos de otro comercio en el carrito. ¿Vaciarlo y empezar de nuevo?")) return;
      setItems([]);
    }
    setComercioId(cid);
    setItems((prev) => {
      const existe = prev.find((i) => i.publicacionId === item.publicacionId);
      if (existe) return prev.map((i) => i.publicacionId === item.publicacionId ? { ...i, cantidad: i.cantidad + cantidad } : i);
      return [...prev, { ...item, cantidad }];
    });
  }, [comercioId]);

  const quitar = useCallback((id: string) => {
    setItems((prev) => {
      const nuevo = prev.filter((i) => i.publicacionId !== id);
      if (nuevo.length === 0) setComercioId(null);
      return nuevo;
    });
  }, []);

  const cambiarCantidad = useCallback((id: string, cantidad: number) => {
    if (cantidad <= 0) { quitar(id); return; }
    setItems((prev) => prev.map((i) => i.publicacionId === id ? { ...i, cantidad } : i));
  }, [quitar]);

  const vaciar = useCallback(() => { setItems([]); setComercioId(null); }, []);

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <Ctx.Provider value={{ items, comercioId, agregar, quitar, cambiarCantidad, vaciar, subtotal, totalItems }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrito must be inside CarritoProvider");
  return ctx;
}
