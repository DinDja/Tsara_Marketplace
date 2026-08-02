"use client"

import { createContext, useContext, useCallback, useState, type ReactNode } from "react"
import type { Product } from "@/lib/types"

interface PendingProductInquiry {
  product: Product
  at: number
}

interface SupportChatContextType {
  pendingInquiry: PendingProductInquiry | null
  openProductInquiry: (product: Product) => void
  clearPendingInquiry: () => void
}

const SupportChatContext = createContext<SupportChatContextType | null>(null)

const INQUIRY_TTL_MS = 10 * 60 * 1000

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const [pendingInquiry, setPendingInquiry] = useState<PendingProductInquiry | null>(null)

  const openProductInquiry = useCallback((product: Product) => {
    setPendingInquiry({ product, at: Date.now() })
  }, [])

  const clearPendingInquiry = useCallback(() => {
    setPendingInquiry(null)
  }, [])

  return (
    <SupportChatContext.Provider value={{ pendingInquiry, openProductInquiry, clearPendingInquiry }}>
      {children}
    </SupportChatContext.Provider>
  )
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext)
  if (!ctx) throw new Error("useSupportChat deve ser usado dentro de SupportChatProvider")
  return ctx
}

export { INQUIRY_TTL_MS }
