import type { Rol, Rubro, EstadoEnvio } from "@mercadovivo/config";

export type { Rol, Rubro, EstadoEnvio };

export type EstadoPedido =
  | "pendiente"
  | "aceptado"
  | "listo"
  | "entregado"
  | "cancelado";

export type Pulgar = "positivo" | "negativo";

export interface Usuario {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  email: string;
  rol: Rol;
  avatarUrl?: string;
  descripcion?: string;
  createdAt: number;
  reputacion?: {
    positivos: number;
    negativos: number;
    total: number;
  };
}

export interface PublicacionVendo {
  id: string;
  comercioId: string;
  titulo: string;
  descripcion: string;
  rubro: Rubro;
  precio: number;
  stock: number;
  imagenes: string[];
  stockDisponible: boolean;
  envioDisponible: boolean;
  activo: boolean;
  enTienda: boolean;
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
  nombreComercio?: string;
  mensaje: string;
  precio: number;
  estado: "pendiente" | "aceptada" | "rechazada";
  createdAt: number;
}

export interface Pedido {
  id: string;
  chatId: string;
  clienteId: string;
  comercioId: string;
  publicacionId: string;
  titulo: string;
  precio: number;
  modalidad: "retiro" | "envio";
  estado: EstadoPedido;
  origen?: string;
  destino?: string;
  calificacionCliente?: boolean;
  calificacionComercio?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Calificacion {
  id: string;
  pedidoId: string;
  remitenteId: string;
  destinatarioId: string;
  pulgar: Pulgar;
  resena: string;
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
  lastSenderId?: string;
  pedidoId?: string;
}

export interface Mensaje {
  id: string;
  chatId: string;
  remitenteId: string;
  texto: string;
  createdAt: number;
}

export type MetodoPago = "efectivo" | "transferencia" | "debito" | "tarjeta";
export type MetodoEnvio = "retiro" | "delivery";
export type EstadoPedidoTienda = "pendiente" | "pago" | "cancelado";

export interface ConfigTienda {
  comercioId: string;
  activo: boolean;
  urlBase: string;
  metodosPago: MetodoPago[];
  metodosEnvio: MetodoEnvio[];
  costoDelivery: number;
  montoMinimoDelivery: number;
  zonaDelivery: string;
  recargosPago: Record<MetodoPago, number>;
  updatedAt: number;
}

export interface ItemCarrito {
  publicacionId: string;
  comercioId: string;
  titulo: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
}

export interface PedidoTienda {
  id: string;
  comercioId: string;
  clienteId: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  items: ItemCarrito[];
  metodoPago: MetodoPago;
  metodoEnvio: MetodoEnvio;
  direccionEntrega?: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  estado: EstadoPedidoTienda;
  createdAt: number;
  updatedAt: number;
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
