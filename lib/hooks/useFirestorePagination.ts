"use client"

import { useState, useEffect, useCallback } from "react"
import type { PaginatedResult } from "@/lib/services/products"

export type FirestorePaginationOptions = {
  initialPage?: number
  deps?: any[]
}

export function useFirestorePagination<T>(
  fetcher: (page: number) => Promise<PaginatedResult<T>>,
  options: FirestorePaginationOptions = {}
) {
  const { initialPage = 1, deps = [] } = options
  const [page, setPage] = useState(initialPage)
  const [result, setResult] = useState<PaginatedResult<T>>({ data: [], total: 0, hasMore: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher(p)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetchPage(page)
  }, [page, fetchPage])

  const goToPage = useCallback((p: number) => setPage(p), [])
  const refetch = useCallback(() => fetchPage(page), [page, fetchPage])

  return { ...result, loading, error, page, goToPage, refetch, setPage }
}
