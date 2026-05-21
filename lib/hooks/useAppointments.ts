"use client"

import { useAsyncData } from "./useAsync"
import { getAppointments, getOccupiedSlots, createAppointment, updateAppointmentStatus } from "@/lib/services"
import type { Appointment } from "@/lib/types"

export function useAppointments() {
  return useAsyncData(getAppointments, [])
}

export function useOccupiedSlots(date: string | undefined) {
  return useAsyncData(() => date ? getOccupiedSlots(date) : Promise.resolve([]), [date])
}

export type { Appointment }
