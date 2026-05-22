import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, Timestamp,
} from "firebase/firestore"
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
