import {
  getDb,
  COLECCIONES,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
} from "@mercadovivo/firebase";
import type { OfertaComercio } from "@mercadovivo/types";

export async function crearOferta(
  data: Omit<OfertaComercio, "id" | "createdAt" | "estado">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLECCIONES.OFERTAS), {
    ...data,
    estado: "pendiente",
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function aceptarOferta(ofertaId: string): Promise<void> {
  await updateDoc(doc(getDb(), COLECCIONES.OFERTAS, ofertaId), { estado: "aceptada" });
}

export async function rechazarOferta(ofertaId: string): Promise<void> {
  await updateDoc(doc(getDb(), COLECCIONES.OFERTAS, ofertaId), { estado: "rechazada" });
}

export async function listarOfertasPorBusco(
  publicacionBuscoId: string
): Promise<OfertaComercio[]> {
  const q = query(
    collection(getDb(), COLECCIONES.OFERTAS),
    where("publicacionBuscoId", "==", publicacionBuscoId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as OfertaComercio);
}

export function suscribirOfertasPorBusco(
  publicacionBuscoId: string,
  cb: (ofertas: OfertaComercio[]) => void
): () => void {
  const q = query(
    collection(getDb(), COLECCIONES.OFERTAS),
    where("publicacionBuscoId", "==", publicacionBuscoId)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as OfertaComercio));
  });
}
