const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Lee .env del root del monorepo si existe
function loadEnv() {
  const envPath = path.resolve(__dirname, "../../.env");
  const envLocal = path.resolve(__dirname, "../../.env.local");
  const env = {};

  for (const p of [envPath, envLocal]) {
    if (fs.existsSync(p)) {
      fs.readFileSync(p, "utf-8")
        .split("\n")
        .forEach((line) => {
          const [key, ...val] = line.split("=");
          if (key && key.startsWith("VITE_")) {
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
    splash: {
      resizeMode: "contain",
      backgroundColor: "#16A34A",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.mercadovivo.app",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#16A34A",
      },
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
