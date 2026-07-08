"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { SkeletonProductGrid } from "@/components/ui/data-skeleton"
import { useCart } from "@/lib/contexts/cart-context"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { useProductsByCategoryLimited } from "@/lib/hooks"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const categories = PRODUCT_CATEGORIES

function isConsultOnly(product: Product) {
  return product.priceOnRequest || product.stockManaged === false || product.price <= 0
}

export function Products() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { data: products, loading } = useProductsByCategoryLimited(activeCategory, 3)
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    if (isConsultOnly(product)) {
      toast.info(`${product.name} esta disponivel sob consulta`)
      return
    }
    if (product.stock <= 0 || product.status === "inactive") {
      toast.error(`${product.name} esta fora de estoque`)
      return
    }
    const added = addItem(product)
    if (!added) {
      toast.error("Quantidade maxima em estoque atingida")
      return
    }
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: "O produto foi adicionado com sucesso.",
      action: { label: "Ver carrinho", onClick: () => window.location.href = "/carrinho" },
    })
  }

  return (
    <section id="produtos" className="relative py-12 md:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gold font-sans">
            Nossa Colecao
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
            Artigos <span className="italic text-gold">Sagrados</span>
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl leading-relaxed text-muted-foreground font-sans text-sm sm:text-base">
            Cada item foi cuidadosamente selecionado e energizado para auxiliar em sua jornada de autoconhecimento e protecao espiritual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-12 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm tracking-wider transition-all duration-300 font-sans",
                activeCategory === cat.id
                  ? "bg-gold text-background"
                  : "bg-secondary/50 text-muted-foreground hover:bg-gold/20 hover:text-gold",
              )}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <SkeletonProductGrid />
        ) : !products || products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 text-3xl opacity-50">
              *
            </div>
            <p className="text-muted-foreground font-sans">Nenhum produto encontrado nesta categoria.</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="h-full"
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gold/30 text-gold hover:bg-gold/10 tracking-wider font-sans group"
          >
            <Link href="/produtos">
              Ver Todos os Produtos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
