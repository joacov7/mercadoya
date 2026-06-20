import { initializeApp, getApps, getApp } from "firebase/app";
import { FIREBASE_CONFIG } from "@mercadovivo/config";

export const firebaseApp =
  getApps().length === 0
    ? FIREBASE_CONFIG.apiKey
      ? initializeApp(FIREBASE_CONFIG)
      : ({ name: "[default]" } as ReturnType<typeof getApp>)
    : getApp();

export function initFirebase(config: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}) {
  if (getApps().length === 0) {
    return initializeApp(config);
  }
  return getApp();
}
