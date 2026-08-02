"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { CartProvider } from "@/lib/contexts/cart-context"
import { SupportChatProvider } from "@/lib/contexts/chat-context"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <SupportChatProvider>
          {children}
          <Toaster />
        </SupportChatProvider>
      </CartProvider>
    </AuthProvider>
  )
}
