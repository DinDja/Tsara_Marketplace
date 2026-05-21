import {
  collection, getDocs, doc, addDoc, query, where, setDoc, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import { getProductById } from "./products"
import type { Review, Product } from "@/lib/types"

const col = collection(db, FIRESTORE_COLLECTIONS.reviews)

function mapDoc(d: any): Review {
  const data = d.data()
  return {
    id: d.id,
    productId: data.productId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    rating: data.rating,
    comment: data.comment,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

function calcRating(reviews: Review[]): { rating: number; count: number } {
  if (!reviews.length) return { rating: 0, count: 0 }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return { rating: Math.round(avg * 10) / 10, count: reviews.length }
}

export async function getReviews(productId: string): Promise<Review[]> {
  try {
    const q = query(col, where("productId", "==", productId))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch { return [] }
}

export async function getLatestReviews(limitCount = 3): Promise<Review[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limitCount)
  } catch { return [] }
}

export async function createReview(data: Omit<Review, "id" | "createdAt">): Promise<{ review: Review; product: Product }> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now })

  try {
    const reviews = await getReviews(data.productId)
    const { rating, count } = calcRating(reviews)
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.products, data.productId), {
      rating, reviews: count, updatedAt: Timestamp.now(),
    }, { merge: true })
  } catch {
    // Product rating aggregation failed, but review was saved
  }

  const product = await getProductById(data.productId)
  return { review: { ...data, id: ref.id, createdAt: now.toDate() }, product: product! }
}
