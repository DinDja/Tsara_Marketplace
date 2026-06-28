"use client"

import { useState, useEffect, useCallback } from "react"
import { useAsyncData } from "./useAsync"
import { getProducts, getProductById, getFeaturedProducts, getProductsByCategory, getProductsPaginated } from "@/lib/services"
import type { Product } from "@/lib/types"
import type { PaginatedResult } from "@/lib/services/products"

export function useProducts() {
  return useAsyncData(getProducts, [])
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

export function useProductsPaginated(filters?: { category?: string; search?: string }) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PaginatedResult<Product>>({ data: [], total: 0, hasMore: false })
  const [loading, setLoading] = useState(true)

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    const res = await getProductsPaginated(p, filters)
    setResult(res)
    setLoading(false)
  }, [filters?.category, filters?.search])

  useEffect(() => {
    fetchPage(page)
  }, [page, fetchPage])

  const goToPage = (p: number) => setPage(p)
  const refetch = useCallback(() => fetchPage(page), [page, fetchPage])

  return { ...result, loading, page, goToPage, refetch }
}

export type { Product }
