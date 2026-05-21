import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
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
export const db = getFirestore(app)
export const auth = getAuth(app)

export const FIRESTORE_COLLECTIONS = {
  products: "products",
  appointments: "appointments",
  clients: "clients",
  orders: "orders",
  users: "users",
  coupons: "coupons",
  reviews: "reviews",
} as const
