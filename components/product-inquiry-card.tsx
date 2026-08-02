"use client"

import Link from "next/link"
import { ArrowRight, MessageCircle, PackageSearch } from "lucide-react"
import type { Product } from "@/lib/types"

export function ProductInquiryCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produto/${product.id}`}
      className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3 transition-colors hover:bg-gold/10"
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground">
          <PackageSearch className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-sans font-medium uppercase tracking-wider text-gold">
          <MessageCircle className="h-3 w-3 shrink-0" /> Consulta de disponibilidade
        </p>
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="flex items-center gap-1 font-sans text-xs text-muted-foreground">
          Ver produto <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    </Link>
  )
}
