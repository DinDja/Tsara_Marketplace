"use client"

import { useEffect } from "react"
import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { getOrders, getOrdersPaginated, getOrdersByClient, getOrdersByClientPaginated } from "@/lib/services"
import type { Order } from "@/lib/types"

export function useOrders() {
  return useAsyncData(getOrders, [])
}

export function useOrdersPaginated(filters?: { status?: string; search?: string }, pageSize = 20) {
  const hook = useFirestorePagination<Order>(
    (page) => getOrdersPaginated(page, filters, pageSize),
    { deps: [filters?.status, filters?.search, pageSize] }
  )

  useEffect(() => {
    hook.setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.search])

  return hook
}

export function useOrdersByClient(clientId: string) {
  return useAsyncData(() => getOrdersByClient(clientId), [clientId])
}

export function useOrdersByClientPaginated(clientId: string, pageSize = 10) {
  const hook = useFirestorePagination<Order>(
    (page) => getOrdersByClientPaginated(clientId, page, pageSize),
    { deps: [clientId, pageSize] }
  )
  return hook
}

export type { Order }
