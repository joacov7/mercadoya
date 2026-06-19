# MercadoVivo 🛒

Plataforma local de Gualeguay, Entre Ríos, Argentina.  
Conecta vecinos con comercios locales a través de publicaciones #Vendo y #Busco.

## Stack

| Área | Tecnología |
|------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Web | React + Vite + TailwindCSS + React Query |
| Mobile | React Native + Expo + NativeWind + Expo Router |
| Backend | Firebase (Auth + Firestore + Storage) |
| Lenguaje | TypeScript |

## Estructura

```
mercadovivo/
├── apps/
│   ├── web/          # App web React
│   └── mobile/       # App móvil Expo
└── packages/
    ├── config/       # Constantes globales
    ├── types/        # Tipos TypeScript compartidos
    ├── firebase/     # SDK Firebase
    ├── core/         # Lógica de negocio
    ├── hooks/        # React hooks compartidos
    └── ui/           # Componentes UI web
```

## Setup rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar Firebase

Creá un proyecto en Firebase Console y copiá las variables:

```bash
# apps/web/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# apps/mobile/.env  (mismas con prefijo EXPO_PUBLIC_)
EXPO_PUBLIC_FIREBASE_API_KEY=...
```

### 3. Desplegar reglas Firestore

```bash
firebase deploy --only firestore
```

### 4. Seed de datos de prueba

```bash
pnpm seed
```

Credenciales generadas:
- Clientes: `cliente1@test.com` … `cliente5@test.com` | `Test1234!`
- Comercios: `comercio1@test.com` … `comercio10@test.com` | `Test1234!`
- Cadetes: `cadete1@test.com` … `cadete5@test.com` | `Test1234!`

### 5. Desarrollo

```bash
pnpm dev:web      # App web en localhost:5173
pnpm dev:mobile   # Expo en QR / emulador
```

## Colecciones Firestore

| Colección | Descripción |
|-----------|-------------|
| `usuarios` | Perfiles (cliente, comercio, cadete, admin) |
| `publicaciones_vendo` | Productos/servicios de comercios |
| `publicaciones_busco` | Solicitudes de vecinos |
| `ofertas_comercio` | Respuestas de comercios a #Busco |
| `chats` | Conversaciones entre usuario y comercio |
| `mensajes` | Mensajes individuales de cada chat |
| `solicitudes_envio` | Pedidos de cadetería |

## Deploy web

```bash
pnpm build:web && firebase deploy --only hosting
```