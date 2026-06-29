"use client"

import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { getClients, getClientsPaginated } from "@/lib/services"
import type { Client } from "@/lib/types"

export function useClients() {
  return useAsyncData(getClients, [])
}

export function useClientsPaginated(pageSize = 20) {
  return useFirestorePagination<Client>(
    (page) => getClientsPaginated(page, pageSize),
    { deps: [pageSize] }
  )
}

export type { Client }
