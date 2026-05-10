"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const categories = [
  { id: "all", label: "Todos" },
  { id: "cristais", label: "Cristais" },
  { id: "velas", label: "Velas Ritualísticas" },
  { id: "incensos", label: "Incensos" },
  { id: "oraculos", label: "Oráculos" },
]

const products = [
  {
    id: 1,
    name: "Ametista Natural",
    category: "cristais",
    price: 89.90,
    originalPrice: 120.00,
    rating: 4.9,
    reviews: 127,
    image: "/products/ametista.jpg",
    badge: "Mais Vendido",
  },
  {
    id: 2,
    name: "Vela de Proteção 7 Dias",
    category: "velas",
    price: 45.00,
    rating: 4.8,
    reviews: 89,
    image: "/products/vela.jpg",
  },
  {
    id: 3,
    name: "Tarot de Marselha Original",
    category: "oraculos",
    price: 189.90,
    rating: 5.0,
    reviews: 234,
    image: "/products/tarot.jpg",
    badge: "Premium",
  },
  {
    id: 4,
    name: "Kit Incensos Purificação",
    category: "incensos",
    price: 59.90,
    rating: 4.7,
    reviews: 156,
    image: "/products/incenso.jpg",
    badge: "Novo",
  },
  {
    id: 5,
    name: "Quartzo Rosa Bruto",
    category: "cristais",
    price: 75.00,
    rating: 4.9,
    reviews: 98,
    image: "/products/quartzo.jpg",
  },
  {
    id: 6,
    name: "Baralho Cigano Tradicional",
    category: "oraculos",
    price: 159.90,
    originalPrice: 199.90,
    rating: 4.9,
    reviews: 312,
    image: "/products/cigano.jpg",
    badge: "Favorito",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

export function Products() {
  return (
    <section id="produtos" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
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

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              className={`px-5 py-2 rounded-full text-sm tracking-wider font-sans transition-all duration-300 ${
                index === 0
                  ? "bg-gold text-background"
                  : "bg-secondary/50 text-muted-foreground hover:bg-gold/20 hover:text-gold"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Card className="group bg-card/50 border-border/50 overflow-hidden hover:border-gold/30 transition-all duration-500">
                {/* Product Image */}
                <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">
                      {product.badge}
                    </div>
                  )}

                  {/* Quick Add */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                    <Button className="bg-gold text-background hover:bg-gold/90 font-sans">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
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
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
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
