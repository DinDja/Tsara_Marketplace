"use client"

import { useAsyncData } from "./useAsync"
import { getProducts, getProductById, getFeaturedProducts, getProductsByCategory } from "@/lib/services"
import type { Product } from "@/lib/types"

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

export type { Product }
