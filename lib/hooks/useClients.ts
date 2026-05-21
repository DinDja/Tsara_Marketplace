"use client"

import { useAsyncData } from "./useAsync"
import { getClients } from "@/lib/services"
import type { Client } from "@/lib/types"

export function useClients() {
  return useAsyncData(getClients, [])
}

export type { Client }
