"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star, ArrowLeft, Loader2 } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SkeletonProductGrid } from "@/components/ui/data-skeleton"
import { useProducts } from "@/lib/hooks"
import { useCart } from "@/lib/contexts/cart-context"
import { toast } from "sonner"
import { cn, formatPrice } from "@/lib/utils"

const categories = [
  { id: "all", label: "Todos" },
  { id: "Cristais", label: "Cristais" },
  { id: "Velas", label: "Velas Ritualísticas" },
  { id: "Incensos", label: "Incensos" },
  { id: "Oráculos", label: "Oráculos" },
]

export default function ProdutosPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { data: products, loading } = useProducts()
  const { addItem } = useCart()

  const filtered = !products ? [] :
    activeCategory === "all" ? products :
    products.filter((p) => p.category === activeCategory)

  const handleAddToCart = (product: NonNullable<typeof products>[number]) => {
    addItem(product)
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: "O produto foi adicionado com sucesso.",
      action: { label: "Ver carrinho", onClick: () => window.location.href = "/carrinho" },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="font-sans text-sm">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" /><span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">Nossa Coleção</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-light text-foreground">
              Todos os <span className="italic text-gold">Produtos</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground font-sans">
              Cada item foi cuidadosamente selecionado e energizado para auxiliar em sua jornada.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={cn("px-5 py-2 rounded-full text-sm tracking-wider font-sans transition-all duration-300",
                  activeCategory === cat.id
                    ? "bg-gold text-background"
                    : "bg-secondary/50 text-muted-foreground hover:bg-gold/20 hover:text-gold"
                )}>
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonProductGrid />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center text-3xl opacity-50">✦</div>
              <p className="text-muted-foreground font-sans">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filtered.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link href={`/produto/${product.id}`} className="block">
                    <Card className="group bg-card/50 border-border/50 overflow-hidden hover:border-gold/30 transition-all duration-500">
                      <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                        {product.badge && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">{product.badge}</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                          <Button className="bg-gold text-background hover:bg-gold/90 font-sans"
                            onClick={(e) => { e.preventDefault(); handleAddToCart(product) }}>
                            <ShoppingCart className="w-4 h-4 mr-2" /> Adicionar
                          </Button>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-gold text-gold" />
                          <span className="text-sm text-gold font-sans">{product.rating}</span>
                          <span className="text-sm text-muted-foreground font-sans">({product.reviews})</span>
                        </div>
                        <h3 className="text-lg font-light text-foreground mb-3 group-hover:text-gold transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {product.stock === 0 ? (
                            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500">Esgotado</span>
                          ) : product.stock <= 5 ? (
                            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500">Acabando</span>
                          ) : (
                            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-green-500/10 text-green-500">Em estoque</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl text-gold font-sans font-medium">R$ {formatPrice(product.price)}</span>
                          {product.originalPrice ? (
                            <span className="text-sm text-muted-foreground line-through font-sans">R$ {formatPrice(product.originalPrice)}</span>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}