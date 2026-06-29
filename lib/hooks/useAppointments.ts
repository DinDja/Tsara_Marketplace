"use client"

import { useEffect } from "react"
import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { getAppointments, getAppointmentsPaginated, getAppointmentsByClient, getAppointmentsByClientPaginated, getOccupiedSlots, createAppointment, updateAppointmentStatus } from "@/lib/services"
import type { Appointment } from "@/lib/types"

export function useAppointments() {
  return useAsyncData(getAppointments, [])
}

export function useAppointmentsPaginated(filters?: { status?: string; search?: string }) {
  const hook = useFirestorePagination<Appointment>(
    (page) => getAppointmentsPaginated(page, filters),
    { deps: [filters?.status, filters?.search] }
  )

  useEffect(() => {
    hook.setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.search])

  return hook
}

export function useAppointmentsByClient(clientId: string, email: string) {
  return useAsyncData(() => getAppointmentsByClient(clientId, email), [clientId, email])
}

export function useAppointmentsByClientPaginated(clientId: string, email: string, pageSize = 10) {
  return useFirestorePagination<Appointment>(
    (page) => getAppointmentsByClientPaginated(clientId, email, page, pageSize),
    { deps: [clientId, email, pageSize] }
  )
}

export function useOccupiedSlots(date: string | undefined) {
  return useAsyncData(() => date ? getOccupiedSlots(date) : Promise.resolve([]), [date])
}

export type { Appointment }
