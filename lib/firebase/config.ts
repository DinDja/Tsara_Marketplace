import { initializeApp, getApps } from "firebase/app"
import {
  initializeFirestore, getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAEGmx-s0P4wufwvllNYU3vbKZarNjVkGg",
  authDomain: "tsara-ab3fc.firebaseapp.com",
  projectId: "tsara-ab3fc",
  storageBucket: "tsara-ab3fc.firebasestorage.app",
  messagingSenderId: "1093746781067",
  appId: "1:1093746781067:web:e9f54195de098e943b5d8e",
  measurementId: "G-PNPJ7VKCJ6"
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// initializeFirestore só pode ser chamado uma vez por app; se já houver
// instância (ex: HMR em dev), ela é reaproveitada via getFirestore.
export let db: ReturnType<typeof initializeFirestore>
try {
  db = initializeFirestore(app, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
} catch {
  db = getFirestore(app)
}
export const auth = getAuth(app)

// Habilita cache IndexedDB do Firestore no navegador (uma única vez).
// Reduz leituras cobradas no servidor: documentos baixados ficam disponíveis offline.
// Em SSR (Node) ou quando já houver múltiplas abas, falha silenciosamente sem quebrar o app.
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {
    // já habilitado em outra aba ou não suportado; seguro ignorar
  })
}

export const FIRESTORE_COLLECTIONS = {
  products: "products",
  appointments: "appointments",
  clients: "clients",
  orders: "orders",
  users: "users",
  coupons: "coupons",
  reviews: "reviews",
  chats: "chats",
  chatMessages: "messages",
  cursos: "cursos",
} as const
