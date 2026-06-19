import { initializeApp, getApps, getApp } from "firebase/app";
import { FIREBASE_CONFIG } from "@mercadovivo/config";

export const firebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
