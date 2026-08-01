"use client"

import { useAuth } from "../contexts/auth-context"
import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { useOrdersByClient } from "./useOrders"
import { getActiveCourses, getCourseById, getCoursesPaginated } from "@/lib/services/courses"
import type { Course } from "@/lib/services/courses"

export function useActiveCourses() {
  return useAsyncData(getActiveCourses, [])
}

export function useCourse(id: string) {
  return useAsyncData(() => getCourseById(id), [id])
}

export function useCoursesPaginated(pageSize = 20) {
  return useFirestorePagination<Course>(
    (page) => getCoursesPaginated(page, pageSize),
    { deps: [pageSize] }
  )
}

const PAID_STATUSES = ["processing", "shipped", "delivered"]

export function usePaidProductIds(): { productIds: Set<string>; loading: boolean; isAuthenticated: boolean } {
  const { user, loading: authLoading } = useAuth()
  const { data: orders, loading: ordersLoading } = useOrdersByClient(user?.id ?? "")
  const productIds = new Set<string>()
  ;(orders ?? []).forEach((o) => {
    if (!PAID_STATUSES.includes(o.status)) return
    o.items.forEach((i) => { if (i.productId) productIds.add(i.productId) })
  })
  return {
    productIds,
    loading: authLoading || ordersLoading,
    isAuthenticated: !!user,
  }
}

export function useCourseAccess(productId?: string): { owned: boolean; loading: boolean; isAuthenticated: boolean } {
  const { productIds, loading, isAuthenticated } = usePaidProductIds()
  const owned = !!productId && productIds.has(productId)
  return { owned, loading, isAuthenticated }
}
