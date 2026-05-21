"use client"

import { useAsyncData } from "./useAsync"
import { getDashboardStats, getTopProducts, getRecentAppointments, getRecentOrders } from "@/lib/services"

export function useDashboardStats() {
  return useAsyncData(getDashboardStats, [])
}

export function useTopProducts() {
  return useAsyncData(getTopProducts, [])
}

export function useRecentAppointments() {
  return useAsyncData(getRecentAppointments, [])
}

export function useRecentOrders() {
  return useAsyncData(getRecentOrders, [])
}
