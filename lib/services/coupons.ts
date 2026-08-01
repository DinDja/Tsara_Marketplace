import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
  limit, orderBy, startAfter, getCountFromServer,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import { cachedQuery, cachedDoc, invalidateCache } from "@/lib/firebase/firecache"
import type { Coupon } from "@/lib/types"
import type { PaginatedResult } from "./products"

const COLLECTION = FIRESTORE_COLLECTIONS.coupons
const col = collection(db, COLLECTION)

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
    const snap = await cachedQuery("coupons:all", col, COLLECTION)
    return snap.docs.map(mapDoc)
  } catch { return [] }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  try {
    const snap = await cachedDoc(`coupons:doc:${id}`, doc(db, COLLECTION, id), COLLECTION)
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch { return null }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const q = query(col, where("code", "==", code.toUpperCase()))
    const snap = await cachedQuery(`coupons:code:${code.toUpperCase()}`, q, COLLECTION)
    if (snap.empty) return null
    return mapDoc(snap.docs[0])
  } catch { return null }
}

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, code: data.code.toUpperCase(), createdAt: now, updatedAt: now })
  invalidateCache(COLLECTION)
  return { ...data, id: ref.id, code: data.code.toUpperCase(), createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  const payload: any = { ...data, updatedAt: Timestamp.now() }
  if (payload.code) payload.code = payload.code.toUpperCase()
  await updateDoc(doc(db, COLLECTION, id), payload)
  invalidateCache(COLLECTION)
  return (await getCouponById(id))!
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
  invalidateCache(COLLECTION)
}

export async function getCouponsPaginated(
  page: number,
  pageSize = 20
): Promise<PaginatedResult<Coupon>> {
  try {
    const total = (await getCountFromServer(col)).data().count

    const dataConstraints: any[] = [orderBy("code")]

    if (page > 1) {
      const prevQ = query(col, ...dataConstraints, limit((page - 1) * pageSize))
      const prevSnap = await cachedQuery(`coupons:page:${page}:${pageSize}:prev`, prevQ, COLLECTION)
      if (prevSnap.docs.length > 0) {
        dataConstraints.push(startAfter(prevSnap.docs[prevSnap.docs.length - 1]))
      }
    }

    dataConstraints.push(limit(pageSize))
    const snap = await cachedQuery(`coupons:page:${page}:${pageSize}`, query(col, ...dataConstraints), COLLECTION)
    const docs = snap.docs.map(mapDoc)
    const totalPages = Math.ceil(total / pageSize)

    return { data: docs, total, hasMore: page < totalPages }
  } catch {
    return { data: [], total: 0, hasMore: false }
  }
}
