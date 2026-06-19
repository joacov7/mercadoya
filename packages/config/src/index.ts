export const APP_NAME = "MercadoVivo";
export const APP_DESCRIPTION =
  "La plataforma local de Gualeguay donde vecinos y comercios se conectan.";
export const APP_VERSION = "0.1.0";
export const APP_CITY = "Gualeguay, Entre Ríos";
export const APP_WHATSAPP_DEFAULT = "543446000000";

export const RUBROS = [
  "Almacén",
  "Carnicería",
  "Verdulería",
  "Ferretería",
  "Veterinaria",
  "Farmacia",
  "Indumentaria",
  "Electrónica",
  "Corralón",
  "Gastronomía",
  "Servicios",
  "Otros",
] as const;

export type Rubro = (typeof RUBROS)[number];

export const COLORES = {
  primary: "#16A34A",
  primaryDark: "#15803D",
  primaryLight: "#86EFAC",
  secondary: "#F59E0B",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;

export const TIPOGRAFIAS = {
  sans: "Inter, system-ui, sans-serif",
  mono: "JetBrains Mono, monospace",
} as const;

export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.VITE_FIREBASE_APP_ID ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const ESTADOS_ENVIO = [
  "pendiente",
  "asignado",
  "retirado",
  "entregado",
  "cancelado",
] as const;

export type EstadoEnvio = (typeof ESTADOS_ENVIO)[number];

export const ROLES = ["cliente", "comercio", "cadete", "admin"] as const;
export type Rol = (typeof ROLES)[number];
