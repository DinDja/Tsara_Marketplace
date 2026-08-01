import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp,
  limit, orderBy, startAfter, getCountFromServer, query, where,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import { encodeImage, decodeImage } from "@/lib/image"
import {
  createProduct, updateProduct, deleteProduct, getProductById, getProductByCourseId,
} from "./products"
import type { PaginatedResult } from "./products"

export interface CourseLesson {
  id: string
  title: string
  type: "video" | "pdf"
  driveUrl: string
  duration?: string
  extraTitle?: string
  extraUrl?: string
  createdAt: Date
}

export type CourseStatus = "draft" | "published"

export interface Course {
  id: string
  name: string
  description: string
  image?: string
  price: number
  originalPrice?: number
  productId?: string
  status: CourseStatus
  active: boolean
  featured: boolean
  announcement?: string
  lessons: CourseLesson[]
  createdAt: Date
  updatedAt: Date
}

const col = collection(db, FIRESTORE_COLLECTIONS.cursos)

const COURSE_PRODUCT_STOCK = 9999

function stripUndefined(value: any): any {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value
  if (Array.isArray(value)) return value.map(stripUndefined)
  if (typeof value === "object") {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = stripUndefined(v)
    }
    return out
  }
  return value
}

function mapDoc(d: any): Course {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    description: data.description ?? "",
    image: decodeImage(data.image),
    price: data.price ?? 0,
    originalPrice: data.originalPrice,
    productId: data.productId,
    status: data.status ?? (data.active === false ? "draft" : "published"),
    active: data.active ?? data.status === "published",
    featured: data.featured ?? false,
    announcement: data.announcement,
    lessons: Array.isArray(data.lessons)
      ? data.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          driveUrl: l.driveUrl,
          duration: l.duration,
          extraTitle: l.extraTitle,
          extraUrl: l.extraUrl,
          createdAt: l.createdAt?.toDate?.() ?? new Date(),
        }))
      : [],
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const snap = await getDocs(col)
    return snap.docs.map(mapDoc)
  } catch {
    return []
  }
}

export async function getActiveCourses(): Promise<Course[]> {
  try {
    const q = query(col, where("active", "==", true))
    const snap = await getDocs(q)
    return snap.docs.map(mapDoc).sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.cursos, id))
    if (!snap.exists()) return null
    return mapDoc(snap)
  } catch {
    return null
  }
}

interface SyncInput {
  name: string
  price: number
  originalPrice?: number
  image?: string
  status: CourseStatus
  legacyProductId?: string
}

async function syncCourseProduct(courseId: string, input: SyncInput): Promise<string | undefined> {
  let product = await getProductByCourseId(courseId)

  if (!product && input.legacyProductId) {
    const legacy = await getProductById(input.legacyProductId)
    if (legacy) {
      await updateProduct(legacy.id, { courseId })
      product = legacy
    }
  }

  if (input.price <= 0) {
    if (product) await deleteProduct(product.id)
    return undefined
  }

  const payload: Record<string, any> = {
    name: input.name,
    price: input.price,
    originalPrice: input.originalPrice && input.originalPrice > 0 ? input.originalPrice : undefined,
    category: "Cursos",
    image: input.image || undefined,
    status: input.status === "published" ? "active" : "inactive",
    stock: COURSE_PRODUCT_STOCK,
    stockManaged: false,
    courseId,
  }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })

  if (product) {
    await updateProduct(product.id, payload)
    return product.id
  }

  const created = await createProduct({
    ...payload,
    rating: 5,
    reviews: 0,
    sold: 0,
    featured: false,
    freeShipping: false,
    priceOnRequest: false,
    description: input.name,
  } as any)
  return created.id
}

export async function createCourse(data: Omit<Course, "id" | "productId" | "createdAt" | "updatedAt">): Promise<Course> {
  const now = Timestamp.now()
  const payload: Record<string, any> = {
    name: data.name,
    description: data.description,
    image: data.image,
    price: data.price,
    originalPrice: data.originalPrice,
    status: data.status,
    active: data.status === "published",
    featured: data.featured,
    announcement: data.announcement,
    lessons: data.lessons,
    createdAt: now,
    updatedAt: now,
  }
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
  if (payload.image?.startsWith("data:")) payload.image = await encodeImage(payload.image)

  const ref = await addDoc(col, stripUndefined(payload))

  let productId: string | undefined
  if (data.price > 0) {
    productId = await syncCourseProduct(ref.id, {
      name: data.name,
      price: data.price,
      originalPrice: data.originalPrice,
      image: payload.image,
      status: data.status,
    })
    if (productId) await updateDoc(doc(db, FIRESTORE_COLLECTIONS.cursos, ref.id), { productId })
  }

  return {
    ...data,
    id: ref.id,
    productId,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  }
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const current = await getCourseById(id)

  let productId = data.productId ?? current?.productId
  let synced = false

  if (
    current &&
    (data.name !== undefined || data.price !== undefined || data.originalPrice !== undefined ||
     data.image !== undefined || data.status !== undefined)
  ) {
    productId = await syncCourseProduct(id, {
      name: data.name ?? current.name,
      price: data.price ?? current.price,
      originalPrice: data.originalPrice !== undefined ? data.originalPrice : current.originalPrice,
      image: data.image !== undefined ? data.image : current.image,
      status: data.status ?? current.status,
      legacyProductId: current.productId,
    })
    synced = true
  }

  const payload: Record<string, any> = {
    ...data,
    active: data.status !== undefined ? data.status === "published" : undefined,
    updatedAt: Timestamp.now(),
  }
  if (synced) {
    if (productId) payload.productId = productId
    else delete payload.productId
  }
  if (payload.active === undefined) delete payload.active
  Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
  if (payload.image?.startsWith("data:")) payload.image = await encodeImage(payload.image)

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.cursos, id), stripUndefined(payload))
  return (await getCourseById(id))!
}

export async function deleteCourse(id: string): Promise<void> {
  const course = await getCourseById(id)
  if (course) {
    const product = await getProductByCourseId(id)
    if (product) await deleteProduct(product.id)
  }
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.cursos, id))
}

export async function getCoursesPaginated(
  page: number,
  pageSize = 20
): Promise<PaginatedResult<Course>> {
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

export function isLessonNew(lesson: CourseLesson, days = 30): boolean {
  const age = Date.now() - (lesson.createdAt?.getTime?.() ?? 0)
  return age >= 0 && age < days * 24 * 60 * 60 * 1000
}

export function courseHasNewLessons(course: Course, days = 30): boolean {
  return course.lessons.some((l) => isLessonNew(l, days))
}
