import {
  getDb,
  COLECCIONES,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
} from "@mercadovivo/firebase";
import type {
  PublicacionVendo,
  PublicacionBusco,
  Rubro,
} from "@mercadovivo/types";

// --- #VENDO ---

export async function publicarVendo(
  data: Omit<PublicacionVendo, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLECCIONES.VENDO), {
    ...data,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function listarVendo(
  rubro?: Rubro
): Promise<PublicacionVendo[]> {
  const constraints = [
    where("activo", "==", true),
    orderBy("createdAt", "desc"),
  ];
  if (rubro) constraints.unshift(where("rubro", "==", rubro));
  const q = query(collection(getDb(), COLECCIONES.VENDO), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionVendo);
}

// --- #BUSCO ---

export async function publicarBusco(
  data: Omit<PublicacionBusco, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLECCIONES.BUSCO), {
    ...data,
    estado: "abierto",
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function listarBusco(
  rubro?: Rubro
): Promise<PublicacionBusco[]> {
  const constraints = [
    where("estado", "==", "abierto"),
    orderBy("createdAt", "desc"),
  ];
  if (rubro) constraints.unshift(where("rubro", "==", rubro));
  const q = query(collection(getDb(), COLECCIONES.BUSCO), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionBusco);
}

export async function cerrarBusco(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLECCIONES.BUSCO, id), { estado: "cerrado" });
}

export async function desactivarVendo(id: string): Promise<void> {
  await updateDoc(doc(getDb(), COLECCIONES.VENDO, id), { activo: false });
}

export async function actualizarVendo(id: string, data: Partial<PublicacionVendo>): Promise<void> {
  await updateDoc(doc(getDb(), COLECCIONES.VENDO, id), data as Record<string, unknown>);
}

export async function listarMisPublicacionesVendo(
  usuarioId: string
): Promise<PublicacionVendo[]> {
  const q = query(
    collection(getDb(), COLECCIONES.VENDO),
    where("comercioId", "==", usuarioId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionVendo);
}

export async function listarProductosTienda(comercioId: string): Promise<PublicacionVendo[]> {
  const q = query(
    collection(getDb(), COLECCIONES.VENDO),
    where("comercioId", "==", comercioId),
    where("enTienda", "==", true),
    where("activo", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionVendo);
}

export async function listarMisPublicacionesBusco(
  usuarioId: string
): Promise<PublicacionBusco[]> {
  const q = query(
    collection(getDb(), COLECCIONES.BUSCO),
    where("clienteId", "==", usuarioId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionBusco);
}
