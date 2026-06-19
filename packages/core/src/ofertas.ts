import {
  db,
  COLECCIONES,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "@mercadovivo/firebase";
import type { OfertaComercio } from "@mercadovivo/types";

export async function crearOferta(
  data: Omit<OfertaComercio, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLECCIONES.OFERTAS), {
    ...data,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function listarOfertasPorBusco(
  publicacionBuscoId: string
): Promise<OfertaComercio[]> {
  const q = query(
    collection(db, COLECCIONES.OFERTAS),
    where("publicacionBuscoId", "==", publicacionBuscoId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as OfertaComercio);
}
