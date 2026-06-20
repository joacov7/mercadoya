import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getAuthInstance } from "./app";

export const loginEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(getAuthInstance(), email, password);

export const registerEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(getAuthInstance(), email, password);

export const logout = () => signOut(getAuthInstance());

export const onAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(getAuthInstance(), cb);
