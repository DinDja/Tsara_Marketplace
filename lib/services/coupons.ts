import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Coupon } from "@/lib/types"

const col = collection(db, FIRESTORE_COLLECTIONS.coupons)

function mapDoc(d: any): Coupon {
  const data = d.data()
  return {
    id: d.id,
    code: data.code,
    discount: data.discount,
    minPurchase: data.minPurchase,
    maxUses: data.maxUses,
    usedCount: data.usedCount ?? 0,
    expiresAt: data.expiresAt?.toDate?.() ?? data.expiresAt,
    active: data.active ?? true,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch { return [] }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.coupons, id))
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch { return null }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const q = query(col, where("code", "==", code.toUpperCase()))
    const snap = await getDocs(q)
    if (snap.empty) return null
    return mapDoc(snap.docs[0])
  } catch { return null }
}

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, code: data.code.toUpperCase(), createdAt: now, updatedAt: now })
  return { ...data, id: ref.id, code: data.code.toUpperCase(), createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  const payload: any = { ...data, updatedAt: Timestamp.now() }
  if (payload.code) payload.code = payload.code.toUpperCase()
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.coupons, id), payload)
  return (await getCouponById(id))!
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.coupons, id))
}
