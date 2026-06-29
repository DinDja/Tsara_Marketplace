import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp,
  limit, orderBy, startAfter, getCountFromServer, query,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { encodeImage, decodeImage } from "@/lib/image"
import type { PaginatedResult } from "./products"

export interface ConsultationType {
  id: string
  name: string
  duration: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  popular: boolean
  icon: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

const col = collection(db, "consultations")

function mapDoc(d: any): ConsultationType {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    duration: data.duration,
    price: data.price,
    originalPrice: data.originalPrice,
    description: data.description,
    features: data.features ?? [],
    popular: data.popular ?? false,
    icon: data.icon ?? "✦",
    image: decodeImage(data.image),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getConsultationTypesLimited(limitCount: number): Promise<ConsultationType[]> {
  try {
    const snap = await getDocs(query(col, orderBy("name"), limit(limitCount)))
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getConsultationTypeById(id: string): Promise<ConsultationType | null> {
  try {
    const snap = await getDoc(doc(db, "consultations", id))
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch {
    return null
  }
}

export async function createConsultationType(data: Omit<ConsultationType, "id" | "createdAt" | "updatedAt">): Promise<ConsultationType> {
  const now = Timestamp.now()
  const payload: Record<string, any> = { ...data, createdAt: now, updatedAt: now }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
  if (payload.image?.startsWith("data:")) payload.image = await encodeImage(payload.image)
  const ref = await addDoc(col, payload)
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateConsultationType(id: string, data: Partial<ConsultationType>): Promise<ConsultationType> {
  const payload: Record<string, any> = { ...data, updatedAt: Timestamp.now() }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
  if (payload.image?.startsWith("data:")) payload.image = await encodeImage(payload.image)
  await updateDoc(doc(db, "consultations", id), payload)
  return (await getConsultationTypeById(id))!
}

export async function deleteConsultationType(id: string): Promise<void> {
  await deleteDoc(doc(db, "consultations", id))
}

export async function getConsultationTypesPaginated(
  page: number,
  pageSize = 20
): Promise<PaginatedResult<ConsultationType>> {
  try {
    const countSnap = await getCountFromServer(col)
    const total = countSnap.data().count

    const dataConstraints: any[] = [orderBy("name")]

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
