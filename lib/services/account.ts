import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { UserAddress, SavedCard } from "@/lib/types"

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

// ─── Saved Cards ───────────────────────────────────────

const cardCol = (uid: string) => collection(db, "users", uid, "cards")

function mapCard(d: any): SavedCard {
  const data = d.data()
  return {
    id: d.id, userId: data.userId, nickname: data.nickname,
    last4: data.last4, brand: data.brand, holderName: data.holderName,
    expiryMonth: data.expiryMonth, expiryYear: data.expiryYear,
    isDefault: data.isDefault ?? false,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

export async function getCards(uid: string): Promise<SavedCard[]> {
  try { const snap = await getDocs(cardCol(uid)); return snap.docs.map(mapCard) }
  catch { return [] }
}

export async function createCard(uid: string, data: Omit<SavedCard, "id" | "userId" | "createdAt">): Promise<SavedCard> {
  const now = Timestamp.now()
  const ref = await addDoc(cardCol(uid), { ...data, userId: uid, createdAt: now })
  return { ...data, id: ref.id, userId: uid, createdAt: now.toDate() }
}

export async function deleteCard(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(cardCol(uid), id))
}
