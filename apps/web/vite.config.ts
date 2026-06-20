import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function loadEnvFile(dir: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const name of [".env", ".env.local"]) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key?.trim() && !key.trim().startsWith("#")) {
        env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return env;
}

export default defineConfig(() => {
  const root = path.resolve(__dirname, "../..");
  const env = loadEnvFile(root);

  return {
    plugins: [react()],
    envDir: root,
    resolve: {
      alias: { "@": "/src" },
    },
    define: {
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY ?? "",
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
        projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
        appId: env.VITE_FIREBASE_APP_ID ?? "",
      }),
    },
  };
});
