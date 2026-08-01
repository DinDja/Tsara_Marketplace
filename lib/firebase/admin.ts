import "server-only"
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let _db: Firestore | null = null

export function getAdminDb(): Firestore {
  if (_db) return _db

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT não configurado. Gere uma chave de conta de serviço no Firebase (Configurações > Contas de serviço) e adicione o JSON ao .env.local"
    )
  }

  let serviceAccount: Record<string, string>
  try {
    serviceAccount = JSON.parse(raw)
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT não é um JSON válido")
  }

  const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) }, "admin")
  _db = getFirestore(app)
  return _db
}
