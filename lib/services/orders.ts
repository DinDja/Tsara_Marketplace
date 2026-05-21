import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Order } from "@/lib/types"

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
    status: data.status ?? "pending",
    paymentMethod: data.paymentMethod,
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

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now, updatedAt: now })
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}
