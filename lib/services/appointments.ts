import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Appointment } from "@/lib/types"

const col = collection(db, FIRESTORE_COLLECTIONS.appointments)

function mapDoc(d: any): Appointment {
  const data = d.data()
  return {
    id: d.id,
    clientId: data.clientId,
    client: data.client,
    email: data.email,
    phone: data.phone,
    type: data.type,
    typeName: data.typeName,
    date: data.date,
    time: data.time,
    status: data.status,
    price: data.price,
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  try {
    const q = query(col, where("date", "==", date))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function createAppointment(data: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<Appointment> {
  const now = Timestamp.now()
  const ref = await addDoc(col, { ...data, createdAt: now, updatedAt: now })
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() }
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"], notes?: string): Promise<Appointment> {
  const update: Record<string, any> = { status, updatedAt: Timestamp.now() }
  if (notes !== undefined) update.notes = notes
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.appointments, id), update)
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.appointments, id))
  return mapDoc(snap)
}

export async function getOccupiedSlots(date: string): Promise<string[]> {
  try {
    const q = query(col, where("date", "==", date))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data().time)
  } catch {
    return []
  }
}

export async function getAppointmentsByClient(clientId: string, email: string): Promise<Appointment[]> {
  const all: Appointment[] = []
  const ids = new Set<string>()

  const fetchBy = async (field: string, value: string) => {
    try {
      const q = query(col, where(field, "==", value))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const a = mapDoc(d)
        if (!ids.has(a.id)) { ids.add(a.id); all.push(a) }
      })
    } catch {
      // query failed for this field, try the other
    }
  }

  await Promise.all([fetchBy("clientId", clientId), fetchBy("email", email)])

  return all.sort((a, b) => {
    const da = new Date(a.date + "T" + a.time).getTime()
    const db = new Date(b.date + "T" + b.time).getTime()
    return db - da
  })
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.appointments, id))
}
