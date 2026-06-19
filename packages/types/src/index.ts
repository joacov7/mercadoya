import type { Rol, Rubro, EstadoEnvio } from "@mercadovivo/config";

export type { Rol, Rubro, EstadoEnvio };

export interface Usuario {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  email: string;
  rol: Rol;
  avatarUrl?: string;
  createdAt: number;
}

export interface PublicacionVendo {
  id: string;
  comercioId: string;
  titulo: string;
  descripcion: string;
  rubro: Rubro;
  precio: number;
  imagenes: string[];
  stockDisponible: boolean;
  activo: boolean;
  createdAt: number;
}

export interface PublicacionBusco {
  id: string;
  clienteId: string;
  titulo: string;
  descripcion: string;
  rubro: Rubro;
  estado: "abierto" | "cerrado";
  createdAt: number;
}

export interface OfertaComercio {
  id: string;
  publicacionBuscoId: string;
  comercioId: string;
  mensaje: string;
  precio: number;
  createdAt: number;
}

export interface Chat {
  id: string;
  clienteId: string;
  comercioId: string;
  publicacionRelacionada: string;
  tipo: "vendo" | "busco";
  updatedAt: number;
  lastMessage?: string;
}

export interface Mensaje {
  id: string;
  chatId: string;
  remitenteId: string;
  texto: string;
  createdAt: number;
}

export interface SolicitudEnvio {
  id: string;
  clienteId: string;
  comercioId: string;
  cadeteId?: string;
  origen: string;
  destino: string;
  observaciones?: string;
  estado: EstadoEnvio;
  createdAt: number;
}
