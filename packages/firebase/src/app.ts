import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function initFirebase(config: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}) {
  _app = getApps().length === 0 ? initializeApp(config) : getApp();
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  return _app;
}

export function getFirebaseApp(): FirebaseApp {
  if (!_app) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _app;
}

export function getAuthInstance(): Auth {
  if (!_auth) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _auth;
}

export function getDbInstance(): Firestore {
  if (!_db) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _db;
}

export function getStorageInstance(): FirebaseStorage {
  if (!_storage) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _storage;
}
