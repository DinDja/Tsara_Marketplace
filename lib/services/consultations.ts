import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { encodeImage, decodeImage } from "@/lib/image"

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
  if (payload.image) payload.image = await encodeImage(payload.image)
  const ref = await addDoc(col, payload)
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateConsultationType(id: string, data: Partial<ConsultationType>): Promise<ConsultationType> {
  const payload: Record<string, any> = { ...data, updatedAt: Timestamp.now() }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
  if (payload.image) payload.image = await encodeImage(payload.image)
  await updateDoc(doc(db, "consultations", id), payload)
  return (await getConsultationTypeById(id))!
}

export async function deleteConsultationType(id: string): Promise<void> {
  await deleteDoc(doc(db, "consultations", id))
}
