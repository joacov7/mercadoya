import {
  db,
  COLECCIONES,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  onSnapshot,
} from "@mercadovivo/firebase";
import type { Pedido, EstadoPedido } from "@mercadovivo/types";

const COL = "pedidos";

export async function crearPedido(
  data: Omit<Pedido, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });

  // Actualizar chat con pedidoId
  await updateDoc(doc(db, COLECCIONES.CHATS, data.chatId), {
    pedidoId: ref.id,
  });

  return ref.id;
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? (snap.data() as Pedido) : null;
}

export async function actualizarEstadoPedido(
  id: string,
  estado: EstadoPedido,
  extra?: Partial<Pedido>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    estado,
    updatedAt: Date.now(),
    ...(extra ?? {}),
  });

  // Si se entregó, descontar stock
  if (estado === "entregado") {
    const pedido = await obtenerPedido(id);
    if (pedido?.publicacionId) {
      const pubRef = doc(db, COLECCIONES.VENDO, pedido.publicacionId);
      const pubSnap = await getDoc(pubRef);
      if (pubSnap.exists()) {
        const stock = (pubSnap.data().stock ?? 1) - 1;
        await updateDoc(pubRef, {
          stock,
          stockDisponible: stock > 0,
          activo: stock > 0,
        });
      }
    }
  }
}

export function suscribirPedido(
  pedidoId: string,
  cb: (pedido: Pedido | null) => void
): () => void {
  return onSnapshot(doc(db, COL, pedidoId), (snap) => {
    cb(snap.exists() ? (snap.data() as Pedido) : null);
  });
}

export async function listarPedidosUsuario(userId: string): Promise<Pedido[]> {
  const asCliente = query(collection(db, COL), where("clienteId", "==", userId));
  const asComercio = query(collection(db, COL), where("comercioId", "==", userId));
  const [s1, s2] = await Promise.all([getDocs(asCliente), getDocs(asComercio)]);
  const todos = [
    ...s1.docs.map((d) => d.data() as Pedido),
    ...s2.docs.map((d) => d.data() as Pedido),
  ];
  return todos.sort((a, b) => b.updatedAt - a.updatedAt);
}
