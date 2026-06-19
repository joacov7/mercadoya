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

declare const __FIREBASE_CONFIG__: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const FIREBASE_CONFIG =
  typeof __FIREBASE_CONFIG__ !== "undefined"
    ? __FIREBASE_CONFIG__
    : {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
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
