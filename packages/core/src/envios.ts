import {
  db,
  COLECCIONES,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from "@mercadovivo/firebase";
import type { SolicitudEnvio } from "@mercadovivo/types";

export async function solicitarEnvio(
  data: Omit<SolicitudEnvio, "id" | "createdAt" | "estado">
): Promise<string> {
  const ref = await addDoc(collection(db, COLECCIONES.ENVIOS), {
    ...data,
    estado: "pendiente",
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function actualizarEstadoEnvio(
  id: string,
  estado: SolicitudEnvio["estado"]
): Promise<void> {
  await updateDoc(doc(db, COLECCIONES.ENVIOS, id), { estado });
}

export async function listarEnviosCadete(cadeteId: string): Promise<SolicitudEnvio[]> {
  const q = query(
    collection(db, COLECCIONES.ENVIOS),
    where("cadeteId", "==", cadeteId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SolicitudEnvio);
}

export async function listarEnviosPendientes(): Promise<SolicitudEnvio[]> {
  const q = query(
    collection(db, COLECCIONES.ENVIOS),
    where("estado", "==", "pendiente")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SolicitudEnvio);
}
