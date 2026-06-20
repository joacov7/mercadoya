import {
  db,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from "@mercadovivo/firebase";
import type { Calificacion, Pulgar } from "@mercadovivo/types";

const COL = "calificaciones";

export async function calificar(data: Omit<Calificacion, "id" | "createdAt">): Promise<void> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });

  // Actualizar reputación del destinatario
  const q = query(collection(db, COL), where("destinatarioId", "==", data.destinatarioId));
  const snap = await getDocs(q);
  const todas = snap.docs.map((d) => d.data() as Calificacion);
  const positivos = todas.filter((c) => c.pulgar === "positivo").length;
  const negativos = todas.filter((c) => c.pulgar === "negativo").length;
  await updateDoc(doc(db, "usuarios", data.destinatarioId), {
    reputacion: { positivos, negativos, total: todas.length },
  });

  // Marcar que este lado ya calificó en el pedido
  const campo =
    data.remitenteId === data.destinatarioId
      ? "calificacionCliente"
      : "calificacionComercio";
  // Se pasa desde afuera cuál campo marcar
}

export async function calificarPedido(
  pedidoId: string,
  campo: "calificacionCliente" | "calificacionComercio",
  data: Omit<Calificacion, "id" | "createdAt">
): Promise<void> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });

  // Actualizar reputación
  const q = query(collection(db, COL), where("destinatarioId", "==", data.destinatarioId));
  const snap = await getDocs(q);
  const todas = snap.docs.map((d) => d.data() as Calificacion);
  const positivos = todas.filter((c) => c.pulgar === "positivo").length;
  const negativos = todas.filter((c) => c.pulgar === "negativo").length;
  await updateDoc(doc(db, "usuarios", data.destinatarioId), {
    reputacion: { positivos, negativos, total: todas.length },
  });

  // Marcar en el pedido que este lado ya calificó
  await updateDoc(doc(db, "pedidos", pedidoId), { [campo]: true });
}

export async function obtenerCalificaciones(userId: string): Promise<Calificacion[]> {
  const q = query(collection(db, COL), where("destinatarioId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Calificacion);
}

export async function yaCalificó(pedidoId: string, remitenteId: string): Promise<boolean> {
  const q = query(
    collection(db, COL),
    where("pedidoId", "==", pedidoId),
    where("remitenteId", "==", remitenteId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
