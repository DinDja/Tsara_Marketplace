import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
  limit, orderBy, startAfter, getCountFromServer,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import { encodeImage, decodeImage } from "@/lib/image"
import type { Product } from "@/lib/types"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}

const PAGE_SIZE = 12

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
    images: Array.isArray(data.images) ? data.images.map(decodeImage).filter(Boolean) : undefined,
    badge: data.badge,
    stock: data.stock ?? 0,
    sold: data.sold ?? 0,
    status: data.status ?? "active",
    featured: data.featured ?? false,
    freeShipping: data.freeShipping ?? false,
    priceOnRequest: data.priceOnRequest ?? false,
    stockManaged: data.stockManaged ?? true,
    source: data.source ? {
      ...data.source,
      importedAt: data.source.importedAt?.toDate?.() ?? data.source.importedAt,
    } : undefined,
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

export async function getProductsPaginated(
  page: number,
  filters?: { category?: string; search?: string }
): Promise<PaginatedResult<Product>> {
  try {
    const countConstraints: any[] = []
    if (filters?.category && filters.category !== "all") {
      countConstraints.push(where("category", "==", filters.category))
    }
    const countSnap = await getCountFromServer(query(col, ...countConstraints))
    const total = countSnap.data().count

    const pageSize = filters?.category && filters.category !== "all" ? 30 : PAGE_SIZE

    const dataConstraints: any[] = [orderBy("name")]
    if (filters?.category && filters.category !== "all") {
      dataConstraints.push(where("category", "==", filters.category))
    }

    if (page > 1) {
      const prevQ = query(col, ...dataConstraints, limit((page - 1) * pageSize))
      const prevSnap = await getDocs(prevQ)
      if (prevSnap.docs.length > 0) {
        dataConstraints.push(startAfter(prevSnap.docs[prevSnap.docs.length - 1]))
      }
    }

    dataConstraints.push(limit(pageSize))
    const snap = await getDocs(query(col, ...dataConstraints))
    const docs = snap.docs.map(mapDoc)
    const totalPages = Math.ceil(total / pageSize)

    return { data: docs, total, hasMore: page < totalPages }
  } catch {
    return { data: [], total: 0, hasMore: false }
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
  if (payload.price > 0) payload.priceOnRequest = false
  if (payload.stock >= 0) payload.stockManaged = true
  if (payload.image) payload.image = await encodeImage(payload.image)
  const ref = await addDoc(col, payload)
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const payload: any = { ...data, updatedAt: Timestamp.now() }
  if (payload.price > 0) payload.priceOnRequest = false
  if (payload.stock >= 0) payload.stockManaged = true
  if (payload.image) payload.image = await encodeImage(payload.image)
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.products, id), payload)
  return (await getProductById(id))!
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.products, id))
}
