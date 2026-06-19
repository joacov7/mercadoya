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
  onSnapshot,
} from "@mercadovivo/firebase";
import type { Chat, Mensaje } from "@mercadovivo/types";

export async function crearChat(
  data: Omit<Chat, "id" | "updatedAt" | "lastMessage">
): Promise<string> {
  const ref = await addDoc(collection(db, COLECCIONES.CHATS), {
    ...data,
    updatedAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function listarChatsUsuario(userId: string): Promise<Chat[]> {
  const asCliente = query(
    collection(db, COLECCIONES.CHATS),
    where("clienteId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const asComercio = query(
    collection(db, COLECCIONES.CHATS),
    where("comercioId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const [snap1, snap2] = await Promise.all([getDocs(asCliente), getDocs(asComercio)]);
  const chats = [
    ...snap1.docs.map((d) => d.data() as Chat),
    ...snap2.docs.map((d) => d.data() as Chat),
  ];
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function enviarMensaje(
  chatId: string,
  remitenteId: string,
  texto: string
): Promise<void> {
  const ref = await addDoc(collection(db, COLECCIONES.MENSAJES), {
    chatId,
    remitenteId,
    texto,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  await updateDoc(doc(db, COLECCIONES.CHATS, chatId), {
    updatedAt: Date.now(),
    lastMessage: texto,
  });
}

export function suscribirMensajes(
  chatId: string,
  cb: (mensajes: Mensaje[]) => void
): () => void {
  const q = query(
    collection(db, COLECCIONES.MENSAJES),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Mensaje));
  });
}
