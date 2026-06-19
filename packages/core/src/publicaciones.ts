import {
  db,
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
  const ref = await addDoc(collection(db, COLECCIONES.VENDO), {
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
  const q = query(collection(db, COLECCIONES.VENDO), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionVendo);
}

// --- #BUSCO ---

export async function publicarBusco(
  data: Omit<PublicacionBusco, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLECCIONES.BUSCO), {
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
  const q = query(collection(db, COLECCIONES.BUSCO), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicacionBusco);
}

export async function cerrarBusco(id: string): Promise<void> {
  await updateDoc(doc(db, COLECCIONES.BUSCO, id), { estado: "cerrado" });
}
