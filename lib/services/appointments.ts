import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
  limit, orderBy, startAfter, getCountFromServer,
  runTransaction,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Appointment } from "@/lib/types"
import type { PaginatedResult } from "./products"

const col = collection(db, FIRESTORE_COLLECTIONS.appointments)
const BLOCKING_STATUSES: Appointment["status"][] = ["pending", "confirmed"]

function slotDocId(date: string, time: string) {
  return `${date}_${time.replace(/\D/g, "")}`
}

function isBlockingStatus(status: Appointment["status"] | undefined) {
  return !!status && BLOCKING_STATUSES.includes(status)
}

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
    message: data.message,
    coupon: data.coupon,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc).sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`).getTime()
      const db = new Date(`${b.date}T${b.time}`).getTime()
      return da - db
    })
  } catch {
    return []
  }
}

export async function getAppointmentsPaginated(
  page: number,
  filters?: { status?: string; search?: string }
): Promise<PaginatedResult<Appointment>> {
  try {
    const countConstraints: any[] = []
    if (filters?.status && filters.status !== "all") {
      countConstraints.push(where("status", "==", filters.status))
    }
    const countSnap = await getCountFromServer(query(col, ...countConstraints))
    const total = countSnap.data().count

    const pageSize = 20

    const dataConstraints: any[] = [orderBy("date", "desc"), orderBy("time", "desc")]
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

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  try {
    const q = query(col, where("date", "==", date))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc).sort((a, b) => a.time.localeCompare(b.time))
  } catch {
    return []
  }
}

export async function createAppointment(data: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<Appointment> {
  const now = Timestamp.now()
  const id = slotDocId(data.date, data.time)
  const ref = doc(db, FIRESTORE_COLLECTIONS.appointments, id)

  const conflicts = await getDocs(query(col, where("date", "==", data.date)))
  const hasLegacyConflict = conflicts.docs.some((d) => {
    const existing = d.data()
    return d.id !== id && existing.time === data.time && isBlockingStatus(existing.status)
  })
  if (hasLegacyConflict) throw new Error("slot-unavailable")

  const existingSlot = await getDoc(ref)
  if (existingSlot.exists() && !isBlockingStatus(existingSlot.data().status)) {
    const fallbackRef = await addDoc(col, { ...data, createdAt: now, updatedAt: now })
    return { ...data, id: fallbackRef.id, createdAt: now.toDate(), updatedAt: now.toDate() }
  }

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref)
    if (existing.exists() && isBlockingStatus(existing.data().status)) {
      throw new Error("slot-unavailable")
    }

    transaction.set(ref, {
      ...data,
      createdAt: existing.exists() ? existing.data().createdAt ?? now : now,
      updatedAt: now,
    })
  })

  return { ...data, id, createdAt: now.toDate(), updatedAt: now.toDate() }
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
    return snap.docs
      .filter((d) => isBlockingStatus(d.data().status))
      .map((d) => d.data().time)
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
