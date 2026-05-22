import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { UserAddress } from "@/lib/types"

// ─── Addresses ─────────────────────────────────────────

const addrCol = (uid: string) => collection(db, "users", uid, "addresses")

function mapAddr(d: any): UserAddress {
  const data = d.data()
  return {
    id: d.id, userId: data.userId, nickname: data.nickname,
    cep: data.cep, street: data.street, number: data.number,
    complement: data.complement, neighborhood: data.neighborhood,
    city: data.city, state: data.state, isDefault: data.isDefault ?? false,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

export async function getAddresses(uid: string): Promise<UserAddress[]> {
  try { const snap = await getDocs(addrCol(uid)); return snap.docs.map(mapAddr) }
  catch { return [] }
}

export async function createAddress(uid: string, data: Omit<UserAddress, "id" | "userId" | "createdAt">): Promise<UserAddress> {
  const now = Timestamp.now()
  const ref = await addDoc(addrCol(uid), { ...data, userId: uid, createdAt: now })
  return { ...data, id: ref.id, userId: uid, createdAt: now.toDate() }
}

export async function updateAddress(uid: string, id: string, data: Partial<UserAddress>): Promise<void> {
  await updateDoc(doc(addrCol(uid), id), data)
}

export async function deleteAddress(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(addrCol(uid), id))
}

