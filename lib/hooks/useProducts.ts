"use client"

import { useEffect } from "react"
import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { getProducts, getProductById, getFeaturedProducts, getProductsByCategory, getProductsByCategoryLimited, getProductsPaginated, getProductOptions } from "@/lib/services"
import type { Product } from "@/lib/types"

export function useProducts() {
  return useAsyncData(getProducts, [])
}

export function useProductOptions(search = "") {
  return useAsyncData(() => getProductOptions(search), [search])
}

export function useProduct(id: string) {
  return useAsyncData(() => getProductById(id).then(r => r!), [id])
}

export function useFeaturedProducts() {
  return useAsyncData(getFeaturedProducts, [])
}

export function useProductsByCategory(category: string) {
  return useAsyncData(() => getProductsByCategory(category), [category])
}

export function useProductsByCategoryLimited(category: string, limitCount: number) {
  return useAsyncData(() => getProductsByCategoryLimited(category, limitCount), [category, limitCount])
}

export function useProductsPaginated(filters?: { category?: string; search?: string }) {
  const hook = useFirestorePagination<Product>(
    (page) => getProductsPaginated(page, filters),
    { deps: [filters?.category, filters?.search] }
  )

  useEffect(() => {
    hook.setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.category, filters?.search])

  return hook
}

export type { Product }
