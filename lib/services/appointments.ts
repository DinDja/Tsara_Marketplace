import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp,
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
    // Busca todos os documentos e faz ordenação/paginação no cliente
    // para evitar necessidade de índices compostos no Firestore
    const snap = await getDocs(col)
    let all = snap.docs.map(mapDoc)

    // Aplica filtro de status
    if (filters?.status && filters.status !== "all") {
      all = all.filter((a) => a.status === filters.status)
    }

    // Aplica filtro de busca (nome do cliente)
    if (filters?.search) {
      const term = filters.search.toLowerCase()
      all = all.filter((a) => a.client.toLowerCase().includes(term))
    }

    // Ordena por data decrescente e horário decrescente
    all.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`).getTime()
      const db = new Date(`${b.date}T${b.time}`).getTime()
      return db - da
    })

    const total = all.length
    const pageSize = 20
    const start = (page - 1) * pageSize
    const data = all.slice(start, start + pageSize)
    const totalPages = Math.ceil(total / pageSize)

    return { data, total, hasMore: page < totalPages }
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

export async function getAppointmentsByClientPaginated(
  clientId: string,
  email: string,
  page: number,
  pageSize = 10
): Promise<PaginatedResult<Appointment>> {
  try {
    // Reaproveita a função não-paginada que já busca por clientId e email
    const all = await getAppointmentsByClient(clientId, email)

    const total = all.length
    const start = (page - 1) * pageSize
    const data = all.slice(start, start + pageSize)
    const totalPages = Math.ceil(total / pageSize)

    return { data, total, hasMore: page < totalPages }
  } catch {
    return { data: [], total: 0, hasMore: false }
  }
}
