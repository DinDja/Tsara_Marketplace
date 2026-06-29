"use client"

import { useAsyncData } from "./useAsync"
import { useFirestorePagination } from "./useFirestorePagination"
import { getCoupons, getCouponsPaginated } from "@/lib/services/coupons"
import { getConsultationTypes, getConsultationTypesLimited, getConsultationTypesPaginated } from "@/lib/services/consultations"
import type { Coupon } from "@/lib/types"
import type { ConsultationType } from "@/lib/services/consultations"

export function useCoupons() {
  return useAsyncData(getCoupons, [])
}

export function useCouponsPaginated(pageSize = 20) {
  return useFirestorePagination<Coupon>(
    (page) => getCouponsPaginated(page, pageSize),
    { deps: [pageSize] }
  )
}

export function useConsultationTypes() {
  return useAsyncData(getConsultationTypes, [])
}

export function useConsultationTypesLimited(limitCount: number) {
  return useAsyncData(() => getConsultationTypesLimited(limitCount), [limitCount])
}

export function useConsultationTypesPaginated(pageSize = 20) {
  return useFirestorePagination<ConsultationType>(
    (page) => getConsultationTypesPaginated(page, pageSize),
    { deps: [pageSize] }
  )
}
