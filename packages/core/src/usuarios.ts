import {
  db,
  COLECCIONES,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "@mercadovivo/firebase";
import type { Usuario } from "@mercadovivo/types";

export async function crearUsuario(
  id: string,
  data: Omit<Usuario, "id" | "createdAt">
): Promise<void> {
  await setDoc(doc(db, COLECCIONES.USUARIOS, id), {
    ...data,
    id,
    createdAt: Date.now(),
  });
}

export async function obtenerUsuario(id: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, COLECCIONES.USUARIOS, id));
  return snap.exists() ? (snap.data() as Usuario) : null;
}

export async function actualizarUsuario(
  id: string,
  data: Partial<Usuario>
): Promise<void> {
  await updateDoc(doc(db, COLECCIONES.USUARIOS, id), data);
}
