"use client"

import { useState, useEffect, useCallback } from "react"
import { useAsyncData } from "./useAsync"
import { getAppointments, getAppointmentsPaginated, getOccupiedSlots, createAppointment, updateAppointmentStatus } from "@/lib/services"
import type { Appointment } from "@/lib/types"
import type { PaginatedResult } from "@/lib/services/products"

export function useAppointments() {
  return useAsyncData(getAppointments, [])
}

export function useAppointmentsPaginated(filters?: { status?: string; search?: string }) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PaginatedResult<Appointment>>({ data: [], total: 0, hasMore: false })
  const [loading, setLoading] = useState(true)

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    const res = await getAppointmentsPaginated(p, filters)
    setResult(res)
    setLoading(false)
  }, [filters?.status, filters?.search])

  useEffect(() => {
    fetchPage(page)
  }, [page, fetchPage])

  const goToPage = (p: number) => setPage(p)

  return { ...result, loading, page, goToPage }
}

export function useOccupiedSlots(date: string | undefined) {
  return useAsyncData(() => date ? getOccupiedSlots(date) : Promise.resolve([]), [date])
}

export type { Appointment }
