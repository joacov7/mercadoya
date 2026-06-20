const fs = require("fs");
const path = require("path");

function loadEnv() {
  const env = {};
  for (const p of ["../../.env", "../../.env.local"]) {
    const full = path.resolve(__dirname, p);
    if (fs.existsSync(full)) {
      fs.readFileSync(full, "utf-8").split("\n").forEach((line) => {
        const [key, ...val] = line.split("=");
        if (key?.trim().startsWith("VITE_")) {
          env[key.trim()] = val.join("=").trim().replace(/^["']|["']$/g, "");
        }
      });
    }
  }
  return env;
}

const env = loadEnv();

module.exports = {
  expo: {
    name: "MercadoVivo",
    slug: "mercadovivo",
    version: "0.1.0",
    scheme: "mercadovivo",
    orientation: "portrait",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.mercadovivo.app",
    },
    android: {
      package: "com.mercadovivo.app",
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      firebaseApiKey: env.VITE_FIREBASE_API_KEY || "",
      firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
      firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID || "",
      firebaseStorageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
      firebaseMessagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      firebaseAppId: env.VITE_FIREBASE_APP_ID || "",
    },
  },
};
