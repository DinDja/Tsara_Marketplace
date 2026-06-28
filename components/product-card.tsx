"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, PackageSearch, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { cn, formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
}

function isConsultOnly(product: Product) {
  return product.priceOnRequest || product.stockManaged === false || product.price <= 0
}

function getStatusLabel(product: Product) {
  if (isConsultOnly(product)) return { label: "Sob consulta", className: "bg-primary/10 text-primary border-primary/25" }
  if (product.stock <= 0 || product.status === "inactive") return { label: "Esgotado", className: "bg-red-500/10 text-red-500 border-red-500/25" }
  if (product.stock <= 5 || product.status === "low_stock") return { label: "Acabando", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25" }
  return { label: "Em estoque", className: "bg-green-500/10 text-green-500 border-green-500/25" }
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const consultOnly = isConsultOnly(product)
  const unavailable = consultOnly || product.stock <= 0 || product.status === "inactive"
  const status = getStatusLabel(product)

  return (
    <LiquidGlassCard className={cn("flex h-full min-h-[548px] flex-col py-0", className)}>
      <Link href={`/produto/${product.id}`} className="relative block h-56 shrink-0 overflow-hidden bg-secondary/30">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/40">
            <PackageSearch className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-white/10" />
        {product.badge ? (
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-background/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            {product.badge}
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4">
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium backdrop-blur", status.className)}>
            {status.label}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm text-gold font-sans">{product.rating}</span>
            <span className="text-sm text-muted-foreground font-sans">({product.reviews})</span>
          </div>
          <span className="max-w-[45%] truncate text-xs text-muted-foreground font-sans">{product.category}</span>
        </div>

        <ExpandableText
          text={product.name}
          lines={2}
          threshold={58}
          className="text-lg font-semibold leading-snug text-foreground"
          buttonClassName="text-[11px]"
        />

        <div className="mt-3 min-h-[58px]">
          <ExpandableText
            text={product.description}
            lines={2}
            threshold={112}
            className="text-sm leading-relaxed text-muted-foreground font-sans"
            emptyText="Sem descricao cadastrada."
          />
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex min-h-8 flex-wrap items-baseline gap-2">
            {consultOnly ? (
              <span className="text-xl font-semibold text-gold font-sans">Sob consulta</span>
            ) : (
              <span className="text-xl font-semibold text-gold font-sans">R$ {formatPrice(product.price)}</span>
            )}
            {product.originalPrice && !consultOnly ? (
              <span className="text-sm text-muted-foreground line-through font-sans">R$ {formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="font-sans">
              <Link href={`/produto/${product.id}`}>
                Ver detalhes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              disabled={unavailable}
              onClick={() => onAddToCart?.(product)}
              className="font-sans"
            >
              <ShoppingCart className="h-4 w-4" />
              {consultOnly ? "Consulta" : "Adicionar"}
            </Button>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  )
}
