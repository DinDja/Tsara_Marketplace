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

export async function updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<Appointment> {
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.appointments, id), { status, updatedAt: Timestamp.now() })
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

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.appointments, id))
}
