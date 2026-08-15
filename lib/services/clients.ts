import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Client } from "@/lib/types"
import type { PaginatedResult } from "./products"

const col = collection(db, FIRESTORE_COLLECTIONS.clients)

function mapDoc(d: any): Client {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    totalSpent: data.totalSpent ?? 0,
    totalAppointments: data.totalAppointments ?? 0,
    totalOrders: data.totalOrders ?? 0,
    lastActivity: data.lastActivity ?? "",
    vip: data.vip ?? false,
    avatar: data.avatar || undefined,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

function mapUserToClient(d: any): Client {
  const data = d.data()
  return {
    id: d.id,
    name: data.name ?? "Sem nome",
    email: data.email ?? "",
    phone: data.phone ?? "",
    totalSpent: 0,
    totalAppointments: 0,
    totalOrders: 0,
    lastActivity: "",
    vip: false,
    avatar: data.avatar || undefined,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getClients(): Promise<Client[]> {
  const map = new Map<string, Client>()

  try {
    const snap = await getDocs(col)
    snap.docs.forEach((d) => { const c = mapDoc(d); map.set(c.id, c) })
  } catch {
    // clients collection unavailable, fall through to users
  }

  try {
    const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.users))
    snap.docs.forEach((d) => {
      if (!map.has(d.id) && d.data().role !== "admin") map.set(d.id, mapUserToClient(d))
    })
  } catch {
    // users collection also unavailable
  }

  return Array.from(map.values())
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

export async function getClientsPaginated(
  page: number,
  pageSize = 20
): Promise<PaginatedResult<Client>> {
  try {
    // Firestore não suporta queries cross-collection, então buscamos todos os
    // clientes (coleção "clients" + fallback "users" via getClients) e
    // paginamos em memória. Isso garante que usuários cadastrados via auth
    // (que só existem em "users") também apareçam no admin.
    const all = await getClients()

    // Ordena por nome (case-insensitive) para consistência com a versão anterior
    all.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"))

    const total = all.length
    const totalPages = Math.ceil(total / pageSize)
    const startIdx = (page - 1) * pageSize
    const data = all.slice(startIdx, startIdx + pageSize)

    return { data, total, hasMore: page < totalPages }
  } catch {
    return { data: [], total: 0, hasMore: false }
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
