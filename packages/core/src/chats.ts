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
  onSnapshot,
} from "@mercadovivo/firebase";
import type { Chat, Mensaje } from "@mercadovivo/types";

export async function crearChat(
  data: Omit<Chat, "id" | "updatedAt" | "lastMessage">
): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLECCIONES.CHATS), {
    ...data,
    updatedAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function listarChatsUsuario(userId: string): Promise<Chat[]> {
  const asCliente = query(
    collection(getDb(), COLECCIONES.CHATS),
    where("clienteId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const asComercio = query(
    collection(getDb(), COLECCIONES.CHATS),
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
  const ref = await addDoc(collection(getDb(), COLECCIONES.MENSAJES), {
    chatId,
    remitenteId,
    texto,
    createdAt: Date.now(),
  });
  await updateDoc(ref, { id: ref.id });
  await updateDoc(doc(getDb(), COLECCIONES.CHATS, chatId), {
    updatedAt: Date.now(),
    lastMessage: texto,
    lastSenderId: remitenteId,
  });
}

export function suscribirChatsUsuario(
  userId: string,
  cb: (chats: Chat[]) => void
): () => void {
  const q1 = query(
    collection(getDb(), COLECCIONES.CHATS),
    where("clienteId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const q2 = query(
    collection(getDb(), COLECCIONES.CHATS),
    where("comercioId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  let chats1: Chat[] = [];
  let chats2: Chat[] = [];
  const emit = () => {
    const all = [...chats1, ...chats2];
    const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());
    cb(unique.sort((a, b) => b.updatedAt - a.updatedAt));
  };
  const unsub1 = onSnapshot(q1, (snap) => { chats1 = snap.docs.map((d) => d.data() as Chat); emit(); });
  const unsub2 = onSnapshot(q2, (snap) => { chats2 = snap.docs.map((d) => d.data() as Chat); emit(); });
  return () => { unsub1(); unsub2(); };
}

export function suscribirMensajes(
  chatId: string,
  cb: (mensajes: Mensaje[]) => void
): () => void {
  const q = query(
    collection(getDb(), COLECCIONES.MENSAJES),
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Mensaje));
  });
}
