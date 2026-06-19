import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { firebaseApp } from "./app";

export const auth = getAuth(firebaseApp);

export const loginEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const onAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);
