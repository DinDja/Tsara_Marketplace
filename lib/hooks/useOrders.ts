"use client"

import { useAsyncData } from "./useAsync"
import { getOrders } from "@/lib/services"
import type { Order } from "@/lib/types"

export function useOrders() {
  return useAsyncData(getOrders, [])
}

export type { Order }
