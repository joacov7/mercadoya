import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env from monorepo root, not apps/web
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "VITE_");

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": "/src" },
    },
    define: {
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
      }),
    },
  };
});
