import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import { encodeImage, decodeImage } from "@/lib/image"
import type { Product } from "@/lib/types"

const col = collection(db, FIRESTORE_COLLECTIONS.products)

function mapDoc(d: any): Product {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    category: data.category,
    price: data.price,
    originalPrice: data.originalPrice,
    rating: data.rating ?? 0,
    reviews: data.reviews ?? 0,
    image: decodeImage(data.image),
    badge: data.badge,
    stock: data.stock ?? 0,
    sold: data.sold ?? 0,
    status: data.status ?? "active",
    featured: data.featured ?? false,
    freeShipping: data.freeShipping ?? false,
    description: data.description,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.products, id))
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch {
    return null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const q = query(col, where("featured", "==", true))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    if (!category || category === "all") return getProducts()
    const q = query(col, where("category", "==", category))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const now = Timestamp.now()
  const payload: any = { ...data, createdAt: now, updatedAt: now }
  if (payload.image) payload.image = await encodeImage(payload.image)
  const ref = await addDoc(col, payload)
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const payload: any = { ...data, updatedAt: Timestamp.now() }
  if (payload.image) payload.image = await encodeImage(payload.image)
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.products, id), payload)
  return (await getProductById(id))!
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.products, id))
}
