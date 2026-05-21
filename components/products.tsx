"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SkeletonProductGrid } from "@/components/ui/data-skeleton"
import { useProductsByCategory } from "@/lib/hooks"
import { useCart } from "@/lib/contexts/cart-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "Todos" },
  { id: "Cristais", label: "Cristais" },
  { id: "Velas", label: "Velas Ritualísticas" },
  { id: "Incensos", label: "Incensos" },
  { id: "Oráculos", label: "Oráculos" },
]

export function Products() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { data: products, loading } = useProductsByCategory(activeCategory)
  const { addItem } = useCart()

  const handleAddToCart = (product: NonNullable<typeof products>[number]) => {
    addItem(product)
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: "O produto foi adicionado com sucesso.",
      action: { label: "Ver carrinho", onClick: () => window.location.href = "/carrinho" },
    })
  }

  return (
    <section id="produtos" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">
            Nossa Coleção
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
            Artigos <span className="italic text-gold">Sagrados</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground font-sans leading-relaxed">
            Cada item foi cuidadosamente selecionado e energizado para auxiliar 
            em sua jornada de autoconhecimento e proteção espiritual.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm tracking-wider font-sans transition-all duration-300",
                activeCategory === cat.id
                  ? "bg-gold text-background"
                  : "bg-secondary/50 text-muted-foreground hover:bg-gold/20 hover:text-gold"
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
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center text-3xl opacity-50">
              ✦
            </div>
            <p className="text-muted-foreground font-sans">
              Nenhum produto encontrado nesta categoria.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link href={`/produto/${product.id}`} className="block">
                  <Card className="group bg-card/50 border-border/50 overflow-hidden hover:border-gold/30 transition-all duration-500">
                    <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                      {product.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">
                          {product.badge}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                        <Button
                          className="bg-gold text-background hover:bg-gold/90 font-sans"
                          onClick={(e) => { e.preventDefault(); handleAddToCart(product) }}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="text-sm text-gold font-sans">{product.rating}</span>
                        <span className="text-sm text-muted-foreground font-sans">
                          ({product.reviews})
                        </span>
                      </div>
                      <h3 className="text-lg font-light text-foreground mb-3 group-hover:text-gold transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl text-gold font-sans font-medium">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through font-sans">
                            R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                  </Link>
                </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="border-gold/30 text-gold hover:bg-gold/10 tracking-wider font-sans group"
          >
            Ver Todos os Produtos
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
