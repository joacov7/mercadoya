import {
  getDb,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "@mercadovivo/firebase";
import type { ConfigTienda, PedidoTienda, EstadoPedidoTienda, ItemCarrito } from "@mercadovivo/types";

const COL_CONFIG = "config_tienda";
const COL_PEDIDOS = "pedidos_tienda";

// --- Config ---

export async function guardarConfigTienda(config: Omit<ConfigTienda, "updatedAt">): Promise<void> {
  await setDoc(doc(getDb(), COL_CONFIG, config.comercioId), {
    ...config,
    updatedAt: Date.now(),
  });
}

export async function obtenerConfigTienda(comercioId: string): Promise<ConfigTienda | null> {
  const snap = await getDoc(doc(getDb(), COL_CONFIG, comercioId));
  return snap.exists() ? (snap.data() as ConfigTienda) : null;
}

export function suscribirConfigTienda(
  comercioId: string,
  cb: (config: ConfigTienda | null) => void
): () => void {
  return onSnapshot(doc(getDb(), COL_CONFIG, comercioId), (snap) => {
    cb(snap.exists() ? (snap.data() as ConfigTienda) : null);
  });
}

// --- Pedidos tienda ---

export async function crearPedidoTienda(
  data: Omit<PedidoTienda, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COL_PEDIDOS), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function obtenerPedidoTienda(id: string): Promise<PedidoTienda | null> {
  const snap = await getDoc(doc(getDb(), COL_PEDIDOS, id));
  return snap.exists() ? (snap.data() as PedidoTienda) : null;
}

export async function actualizarEstadoPedidoTienda(
  id: string,
  estado: EstadoPedidoTienda
): Promise<void> {
  await updateDoc(doc(getDb(), COL_PEDIDOS, id), { estado, updatedAt: Date.now() });
}

export function suscribirPedidoTienda(
  pedidoId: string,
  cb: (pedido: PedidoTienda | null) => void
): () => void {
  return onSnapshot(doc(getDb(), COL_PEDIDOS, pedidoId), (snap) => {
    cb(snap.exists() ? (snap.data() as PedidoTienda) : null);
  });
}

export async function listarPedidosTiendaComercio(comercioId: string): Promise<PedidoTienda[]> {
  const q = query(collection(getDb(), COL_PEDIDOS), where("comercioId", "==", comercioId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PedidoTienda).sort((a, b) => b.createdAt - a.createdAt);
}
