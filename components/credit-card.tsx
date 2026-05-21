"use client"

import { cn } from "@/lib/utils"
import { detectCardBrand } from "@/lib/services/card-brand"
import { CardBrandIcon } from "@/components/card-brand-icon"
import { motion } from "framer-motion"

interface CreditCardProps {
  number: string
  holder: string
  expiry: string
  cvv: string
  flipped?: boolean
  className?: string
}

export function CreditCardDisplay({ number, holder, expiry, cvv, flipped, className }: CreditCardProps) {
  const brand = detectCardBrand(number)
  const displayNumber = number || "•••• •••• •••• ••••"
  const displayHolder = holder || "SEU NOME"
  const displayExpiry = expiry || "MM/AA"

  return (
    <motion.div
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      className={cn("relative w-full max-w-sm h-48 rounded-2xl perspective-1000", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className={cn(
        "absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden transition-opacity",
        flipped ? "opacity-0" : "opacity-100"
      )}
        style={{
          background: brand
            ? `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`
            : "linear-gradient(135deg, #1a1a2e, #16213e)",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-10 -mb-10 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-lg font-bold text-white/90 tracking-wider">TSARA</span>
          <span className="flex">{brand ? <CardBrandIcon brand={brand.name} className="w-10 h-6 [&>div]:rounded-sm [&>div]:w-full [&>div]:h-full" /> : <span className="text-lg">💳</span>}</span>
        </div>

        <div className="relative z-10">
          <p className="text-xl tracking-[0.15em] text-white font-mono">{displayNumber}</p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-[10px] text-white/60 font-sans uppercase tracking-wider mb-0.5">Titular</p>
            <p className="text-sm text-white font-sans truncate uppercase">{displayHolder}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/60 font-sans uppercase tracking-wider mb-0.5">Validade</p>
            <p className="text-sm text-white font-mono">{displayExpiry}</p>
          </div>
        </div>
      </div>

      {/* Back */}
      <div className={cn(
        "absolute inset-0 rounded-2xl overflow-hidden transition-opacity",
        flipped ? "opacity-100" : "opacity-0"
      )}
        style={{
          background: brand
            ? `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`
            : "linear-gradient(135deg, #1a1a2e, #16213e)",
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="mt-6 h-10 bg-black/20" />
        <div className="mt-4 mx-6 h-10 bg-white/20 rounded flex items-center justify-end px-3">
          <span className="text-lg text-white font-mono tracking-wider">{cvv || "•••"}</span>
        </div>
        <p className="absolute bottom-4 left-6 text-[10px] text-white/40 font-sans">CVV</p>
      </div>
    </motion.div>
  )
}

