import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseApp } from "./app";

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export const COLECCIONES = {
  USUARIOS: "usuarios",
  VENDO: "publicaciones_vendo",
  BUSCO: "publicaciones_busco",
  OFERTAS: "ofertas_comercio",
  CHATS: "chats",
  MENSAJES: "mensajes",
  ENVIOS: "solicitudes_envio",
} as const;

export {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
};

export type { QueryConstraint };
