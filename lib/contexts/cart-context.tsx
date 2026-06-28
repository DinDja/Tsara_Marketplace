"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "@/lib/types"
import { getProductById } from "@/lib/services/products"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => boolean
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, delta: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = "tsara-cart"

function isPurchasable(product: Product) {
  return product.status !== "inactive"
    && !product.priceOnRequest
    && product.price > 0
    && product.stockManaged !== false
    && product.stock > 0
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    ;(async () => {
      const validated = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProductById(item.productId)
            if (!product || !isPurchasable(product)) return null
            return {
              ...item,
              stock: product.stock,
              status: product.status,
              price: product.price,
              priceOnRequest: product.priceOnRequest,
              stockManaged: product.stockManaged,
            }
          } catch {
            return item
          }
        })
      )
      const filtered = validated.filter(Boolean) as CartItem[]
      if (filtered.length !== items.length) setItems(filtered)
    })()
  }, [hydrated])

  useEffect(() => {
    if (hydrated) saveCart(items)
  }, [items, hydrated])

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (!isPurchasable(product)) {
      return false
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      const currentQty = existing ? existing.quantity : 0
      if (currentQty + quantity > product.stock) {
        return prev
      }
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity, stock: product.stock } : i
        )
      }
      return [
        ...prev,
        {
          id: `cart-${product.id}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity,
          image: product.image,
          freeShipping: product.freeShipping,
          status: product.status,
          stock: product.stock,
          priceOnRequest: product.priceOnRequest,
          stockManaged: product.stockManaged,
        },
      ]
    })
    return true
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.stock || 99)) } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider")
  return ctx
}
