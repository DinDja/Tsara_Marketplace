"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { MoonIcon } from "@/components/moon-icon"
import { ProductCard } from "@/components/product-card"
import { SkeletonProductGrid } from "@/components/ui/data-skeleton"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/contexts/cart-context"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { useProductsPaginated } from "@/lib/hooks"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const categories = PRODUCT_CATEGORIES

function isConsultOnly(product: Product) {
  return product.priceOnRequest || product.stockManaged === false || product.price <= 0
}

export default function ProdutosPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const pageSize = activeCategory !== "all" ? 30 : 12
  const { data: products, loading, page, total, hasMore, goToPage, setPage } = useProductsPaginated(
    activeCategory !== "all" ? { category: activeCategory } : undefined
  )
  const { addItem } = useCart()

  useEffect(() => {
    setPage(1)
  }, [activeCategory, setPage])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-12 text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-gold font-sans">Nossa Colecao</span>
            <h1 className="mt-4 text-4xl font-light text-foreground md:text-5xl">
              Todos os <span className="italic text-gold">Produtos</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground font-sans">
              Cada item foi cuidadosamente selecionado e energizado para auxiliar em sua jornada.
            </p>
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm tracking-wider transition-all duration-300 font-sans",
                  activeCategory === cat.id
                    ? "bg-gold text-background"
                    : "bg-secondary/50 text-muted-foreground hover:bg-gold/20 hover:text-gold",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonProductGrid />
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 text-3xl opacity-50">
                *
              </div>
              <p className="text-muted-foreground font-sans">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.35) }}
                    className="h-full"
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1 || loading}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </Button>
                  <span className="px-4 text-sm font-sans text-muted-foreground">
                    Pagina {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasMore || loading}
                    className="gap-1"
                  >
                    Proximo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
