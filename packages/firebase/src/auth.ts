import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "./app";

export const loginEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(getAuth(getFirebaseApp()), email, password);

export const registerEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(getAuth(getFirebaseApp()), email, password);

export const logout = () => signOut(getAuth(getFirebaseApp()));

export const onAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(getAuth(getFirebaseApp()), cb);
