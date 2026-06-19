/**
 * Script para poblar Firestore con datos de prueba.
 * Uso: pnpm seed
 * Requiere que FIREBASE_* variables estén en .env
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import type { PublicacionVendo, PublicacionBusco } from "@mercadovivo/types";

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY!,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.VITE_FIREBASE_APP_ID!,
});

const db = getFirestore(app);
const auth = getAuth(app);

async function crearRef(col: string, data: object): Promise<string> {
  const ref = await addDoc(collection(db, col), { ...data, createdAt: Date.now() });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

const COMERCIOS = [
  { nombre: "Carnicería Don Pedro", rubro: "Carnicería", whatsapp: "543446111001" },
  { nombre: "Ferretería El Tornillo", rubro: "Ferretería", whatsapp: "543446111002" },
  { nombre: "Verdulería La Huerta", rubro: "Verdulería", whatsapp: "543446111003" },
  { nombre: "Veterinaria Animalitos", rubro: "Veterinaria", whatsapp: "543446111004" },
  { nombre: "Farmacia Central", rubro: "Farmacia", whatsapp: "543446111005" },
  { nombre: "Almacén El Rincón", rubro: "Almacén", whatsapp: "543446111006" },
  { nombre: "Ropa & Más", rubro: "Indumentaria", whatsapp: "543446111007" },
  { nombre: "TecnoShop GY", rubro: "Electrónica", whatsapp: "543446111008" },
  { nombre: "Corralón El Ladrillo", rubro: "Corralón", whatsapp: "543446111009" },
  { nombre: "Pizza Roma", rubro: "Gastronomía", whatsapp: "543446111010" },
];

const PRODUCTOS: Omit<PublicacionVendo, "id" | "comercioId" | "createdAt">[] = [
  { titulo: "Asado vacío premium", descripcion: "1 kg de asado vacío fresco, listo para la parrilla", rubro: "Carnicería", precio: 3200, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Costillas de cerdo", descripcion: "Costillas de cerdo, ideales para asar", rubro: "Carnicería", precio: 2800, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Taladro inalámbrico Bosch", descripcion: "Taladro Bosch 18V con cargador y 2 baterías", rubro: "Ferretería", precio: 45000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Pinturas latex interior", descripcion: "Pintura látex blanca interior 4L", rubro: "Ferretería", precio: 8500, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Cajón de verduras mixtas", descripcion: "Tomate, cebolla, zanahoria, lechuga, pepino", rubro: "Verdulería", precio: 4500, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Alimento perro Royal Canin 15kg", descripcion: "Royal Canin adultos razas medianas", rubro: "Veterinaria", precio: 38000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Ibuprofeno 400mg x20", descripcion: "Ibuprofeno genérico, sin receta", rubro: "Farmacia", precio: 1200, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Aceite girasol 3L", descripcion: "Aceite de girasol primera calidad", rubro: "Almacén", precio: 2400, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Remera polo hombre talle M", descripcion: "Remera polo algodón 100%, varios colores", rubro: "Indumentaria", precio: 5500, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Parlante Bluetooth JBL", descripcion: "JBL Go 3 resistente al agua 5h batería", rubro: "Electrónica", precio: 22000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Arena gruesa 1m3", descripcion: "Arena gruesa lavada para construcción", rubro: "Corralón", precio: 12000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Pizza napolitana familiar", descripcion: "Pizza napolitana horno a leña, 8 porciones", rubro: "Gastronomía", precio: 4800, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Peceto 500g", descripcion: "Peceto limpio listo para milanesas", rubro: "Carnicería", precio: 2600, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Amoladora angular 9\"", descripcion: "Amoladora 2200W con disco de corte incluido", rubro: "Ferretería", precio: 28000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Banana x kg", descripcion: "Bananas maduras frescas llegadas hoy", rubro: "Verdulería", precio: 900, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Champú antipulgas", descripcion: "Champú antipulgas perros y gatos 500ml", rubro: "Veterinaria", precio: 3200, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Pasta dental Colgate x3", descripcion: "Pack 3 unidades Colgate triple acción", rubro: "Farmacia", precio: 2800, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Yerba Rosamonte 1kg", descripcion: "Yerba mate Rosamonte 1kg tradicional", rubro: "Almacén", precio: 1800, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Jeans denim mujer", descripcion: "Jean denim azul corte recto talle 38-46", rubro: "Indumentaria", precio: 12000, imagenes: [], stockDisponible: true, activo: true },
  { titulo: "Cable HDMI 3 metros", descripcion: "Cable HDMI 2.0 4K 60Hz dorado", rubro: "Electrónica", precio: 3500, imagenes: [], stockDisponible: true, activo: true },
];

const BUSCOS: Omit<PublicacionBusco, "id" | "clienteId" | "createdAt">[] = [
  { titulo: "Busco 5 kg de asado vacío", descripcion: "Para este fin de semana. Necesito buena calidad", rubro: "Carnicería", estado: "abierto" },
  { titulo: "Busco amoladora Bosch o similar", descripcion: "Para trabajo en madera, necesito con disco", rubro: "Ferretería", estado: "abierto" },
  { titulo: "Busco alimento balanceado para labrador", descripcion: "Royal Canin o Purina, 15kg preferiblemente", rubro: "Veterinaria", estado: "abierto" },
  { titulo: "Busco caja de azulejos 20x20", descripcion: "Necesito para baño, color blanco o beige", rubro: "Corralón", estado: "abierto" },
  { titulo: "Busco teclado inalámbrico", descripcion: "Para PC de escritorio, que tenga numpad", rubro: "Electrónica", estado: "abierto" },
  { titulo: "Busco anteojos de sol para mujer", descripcion: "Polarizados si puede ser", rubro: "Indumentaria", estado: "abierto" },
  { titulo: "Busco pizza familiar para hoy", descripcion: "Con delivery si es posible al centro", rubro: "Gastronomía", estado: "abierto" },
  { titulo: "Busco paracetamol 500mg x40", descripcion: "Para tenerte de reserva en casa", rubro: "Farmacia", estado: "abierto" },
  { titulo: "Busco bolsas de cemento x5", descripcion: "Loma Negra o similar, retiro yo", rubro: "Corralón", estado: "abierto" },
  { titulo: "Busco verduras para guiso", descripcion: "Cebolla, morron, tomate, papa, batata", rubro: "Verdulería", estado: "abierto" },
  { titulo: "Busco fideos tipo spaghetti x6 paquetes", descripcion: "Marca no importa, precio importa", rubro: "Almacén", estado: "abierto" },
  { titulo: "Busco pollera de lino talle 40", descripcion: "Cualquier color, para el calor", rubro: "Indumentaria", estado: "abierto" },
  { titulo: "Busco plomero para urgencia", descripcion: "Se me rompió un caño debajo del lavatorio", rubro: "Servicios", estado: "abierto" },
  { titulo: "Busco heladera usada en buen estado", descripcion: "Mínimo 280 lts, con freezer", rubro: "Electrónica", estado: "abierto" },
  { titulo: "Busco cadete para llevar encomienda", descripcion: "Desde Av. Rocamora hasta barrio Norte", rubro: "Servicios", estado: "abierto" },
];

async function main() {
  console.log("🌱 Iniciando seed de MercadoVivo...\n");

  // Crear clientes de prueba
  const clienteIds: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const email = `cliente${i}@test.com`;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, "Test1234!");
      await crearRef("usuarios", {
        id: user.uid,
        nombre: `Cliente ${i}`,
        email,
        telefono: `344600000${i}`,
        whatsapp: `3446000${i}0${i}`,
        rol: "cliente",
      });
      clienteIds.push(user.uid);
      console.log(`✅ Cliente ${i} creado`);
    } catch {
      console.log(`⚠️  Cliente ${i} ya existe, continuando...`);
      clienteIds.push(`cliente-seed-${i}`);
    }
  }

  // Crear cadetes
  for (let i = 1; i <= 5; i++) {
    const email = `cadete${i}@test.com`;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, "Test1234!");
      await crearRef("usuarios", {
        id: user.uid,
        nombre: `Cadete ${i}`,
        email,
        telefono: `344601000${i}`,
        whatsapp: `3446010${i}0${i}`,
        rol: "cadete",
      });
      console.log(`✅ Cadete ${i} creado`);
    } catch {
      console.log(`⚠️  Cadete ${i} ya existe`);
    }
  }

  // Crear comercios y sus publicaciones
  const comercioIds: string[] = [];
  for (let i = 0; i < COMERCIOS.length; i++) {
    const comercio = COMERCIOS[i];
    const email = `comercio${i + 1}@test.com`;
    let uid: string;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, "Test1234!");
      uid = user.uid;
      await crearRef("usuarios", {
        id: uid,
        nombre: comercio.nombre,
        email,
        telefono: comercio.whatsapp,
        whatsapp: comercio.whatsapp,
        rol: "comercio",
      });
      console.log(`✅ Comercio: ${comercio.nombre}`);
    } catch {
      uid = `comercio-seed-${i}`;
      console.log(`⚠️  Comercio ${comercio.nombre} ya existe`);
    }
    comercioIds.push(uid);
  }

  // Publicaciones #Vendo
  console.log("\n📦 Creando publicaciones #Vendo...");
  for (let i = 0; i < PRODUCTOS.length; i++) {
    await crearRef("publicaciones_vendo", {
      ...PRODUCTOS[i],
      comercioId: comercioIds[i % comercioIds.length],
    });
  }
  console.log(`✅ ${PRODUCTOS.length} publicaciones #Vendo creadas`);

  // Publicaciones #Busco
  console.log("\n🔍 Creando publicaciones #Busco...");
  for (let i = 0; i < BUSCOS.length; i++) {
    await crearRef("publicaciones_busco", {
      ...BUSCOS[i],
      clienteId: clienteIds[i % clienteIds.length],
    });
  }
  console.log(`✅ ${BUSCOS.length} publicaciones #Busco creadas`);

  // Chats y mensajes de prueba
  console.log("\n💬 Creando chats de prueba...");
  for (let i = 0; i < 5; i++) {
    const chatRef = await crearRef("chats", {
      clienteId: clienteIds[i % clienteIds.length],
      comercioId: comercioIds[i % comercioIds.length],
      publicacionRelacionada: `pub-seed-${i}`,
      tipo: i % 2 === 0 ? "busco" : "vendo",
      updatedAt: Date.now(),
      lastMessage: "Hola! Tengo disponibilidad",
    });

    const mensajes = [
      { remitenteId: clienteIds[i % clienteIds.length], texto: "Hola! Vi tu publicación y me interesa" },
      { remitenteId: comercioIds[i % comercioIds.length], texto: "¡Hola! Claro, tengo disponibilidad. ¿Cuánto necesitás?" },
      { remitenteId: clienteIds[i % clienteIds.length], texto: "Necesito 2 kilos por favor" },
      { remitenteId: comercioIds[i % comercioIds.length], texto: "Perfecto! Te lo reservo. Podés pasar a buscarlo hoy" },
      { remitenteId: clienteIds[i % clienteIds.length], texto: "Genial! Paso a las 17hs. Gracias!" },
      { remitenteId: comercioIds[i % comercioIds.length], texto: "Te esperamos 👍" },
    ];

    for (const msg of mensajes) {
      await crearRef("mensajes", { ...msg, chatId: chatRef });
    }
  }
  console.log("✅ 5 chats con mensajes creados");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\nCredenciales de prueba:");
  console.log("  Clientes: cliente1@test.com ... cliente5@test.com | pass: Test1234!");
  console.log("  Comercios: comercio1@test.com ... comercio10@test.com | pass: Test1234!");
  console.log("  Cadetes: cadete1@test.com ... cadete5@test.com | pass: Test1234!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
