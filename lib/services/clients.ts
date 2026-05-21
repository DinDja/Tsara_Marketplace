import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Client } from "@/lib/types"

const col = collection(db, FIRESTORE_COLLECTIONS.clients)

function mapDoc(d: any): Client {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    totalSpent: data.totalSpent ?? 0,
    totalAppointments: data.totalAppointments ?? 0,
    totalOrders: data.totalOrders ?? 0,
    lastActivity: data.lastActivity ?? "",
    vip: data.vip ?? false,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getClients(): Promise<Client[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.clients, id))
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch {
    return null
  }
}

export async function searchClients(query_str: string): Promise<Client[]> {
  try {
    const all = await getClients()
    const q = query_str.toLowerCase()
    return all.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  } catch {
    return []
  }
}

export async function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now, updatedAt: now })
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.clients, id), { ...data, updatedAt: Timestamp.now() })
  return (await getClientById(id))!
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.clients, id))
}
