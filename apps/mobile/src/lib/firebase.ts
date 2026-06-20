import { initializeApp, getApps, getApp } from "firebase/app";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
