import {
  collection, getDocs, getDoc, doc, addDoc, query, where, orderBy, limit, setDoc, Timestamp,
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
    const q = query(col, where("productId", "==", productId), orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc)
  } catch { return [] }
}

export async function getLatestReviews(limitCount = 3): Promise<Review[]> {
  try {
    const q = query(col, orderBy("createdAt", "desc"), limit(limitCount))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc)
  } catch { return [] }
}

export async function createReview(data: Omit<Review, "id" | "createdAt">): Promise<{ review: Review; product: Product }> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now })

  const reviews = await getReviews(data.productId)
  const { rating, count } = calcRating(reviews)

  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.products, data.productId))
  const productData = snap.data()
  if (snap.exists() && productData) {
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.products, data.productId), {
      rating, reviews: count, updatedAt: Timestamp.now(),
    }, { merge: true })
  }

  const product = await getProductById(data.productId)
  return { review: { ...data, id: ref.id, createdAt: now.toDate() }, product: product! }
}
