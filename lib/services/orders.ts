import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, Timestamp,
  limit, orderBy, startAfter, getCountFromServer,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Order } from "@/lib/types"
import type { PaginatedResult } from "./products"

const col = collection(db, FIRESTORE_COLLECTIONS.orders)

function mapDoc(d: any): Order {
  const data = d.data()
  return {
    id: d.id,
    clientId: data.clientId,
    client: data.client,
    items: data.items ?? [],
    total: data.total ?? 0,
    subtotal: data.subtotal ?? 0,
    discount: data.discount ?? 0,
    shipping: data.shipping ?? 0,
    coupon: data.coupon,
    shippingAddress: data.shippingAddress,
    status: data.status ?? "pending",
    paymentMethod: data.paymentMethod,
    orderNsu: data.orderNsu,
    checkoutUrl: data.checkoutUrl,
    transactionNsu: data.transactionNsu,
    paidAmount: data.paidAmount,
    captureMethod: data.captureMethod,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const ref = doc(col, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch {
    return null
  }
}

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now, updatedAt: now })
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateOrder(
  id: string,
  data: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const payload = { ...data, updatedAt: Timestamp.now() }
  Object.keys(payload).forEach((k) => { if ((payload as any)[k] === undefined) delete (payload as any)[k] })
  await updateDoc(doc(col, id), payload)
}

export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  try {
    const q = query(col, where("clientId", "==", clientId))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch {
    return []
  }
}

export async function getOrdersPaginated(
  page: number,
  filters?: { status?: string; search?: string },
  pageSize = 20
): Promise<PaginatedResult<Order>> {
  try {
    const countConstraints: any[] = []
    if (filters?.status && filters.status !== "all") {
      countConstraints.push(where("status", "==", filters.status))
    }
    const countSnap = await getCountFromServer(query(col, ...countConstraints))
    const total = countSnap.data().count

    const dataConstraints: any[] = [orderBy("createdAt", "desc")]
    if (filters?.status && filters.status !== "all") {
      dataConstraints.push(where("status", "==", filters.status))
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

export async function getOrdersByClientPaginated(
  clientId: string,
  page: number,
  pageSize = 10
): Promise<PaginatedResult<Order>> {
  try {
    const baseConstraints: any[] = [where("clientId", "==", clientId)]

    const countSnap = await getCountFromServer(query(col, ...baseConstraints))
    const total = countSnap.data().count

    const dataConstraints: any[] = [
      ...baseConstraints,
      orderBy("createdAt", "desc"),
    ]

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
