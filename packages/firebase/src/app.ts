import { initializeApp, getApps, getApp } from "firebase/app";

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

export function getFirebaseApp() {
  if (getApps().length === 0) {
    throw new Error("Firebase not initialized. Call initFirebase() first.");
  }
  return getApp();
}
