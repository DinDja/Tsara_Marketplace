"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, ShoppingCart, Star, MessageCircle,
  Truck, Shield,
} from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { SkeletonProductGrid } from "@/components/ui/data-skeleton"
import { useProduct } from "@/lib/hooks"
import { useCart } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSupportChat } from "@/lib/contexts/chat-context"
import { getReviews, createReview } from "@/lib/services"
import { toast } from "sonner"
import { cn, formatPrice } from "@/lib/utils"
import type { Review } from "@/lib/types"

const ratingLabels = ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"]

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const { data: product, loading } = useProduct(id)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { openProductInquiry } = useSupportChat()
  const router = useRouter()

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadReviews = async () => {
    if (!reviewsLoaded && id) {
      const data = await getReviews(id)
      setReviews(data)
      setReviewsLoaded(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <SkeletonProductGrid />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-sans">Produto não encontrado</p>
          <Button asChild className="mt-4"><Link href="/">Voltar</Link></Button>
        </div>
      </div>
    )
  }

  const consultOnly = product.priceOnRequest || product.stockManaged === false || product.price <= 0
  const unavailable = consultOnly || product.stock <= 0 || product.status === "inactive"

  const handleConsult = () => {
    openProductInquiry(product)
    if (!user) {
      toast.info("Faça login para consultar a disponibilidade do produto")
      router.push(`/login?redirect=${encodeURIComponent(`/produto/${product.id}`)}`)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) { toast.error("Faça login para avaliar"); return }
    if (!userRating) { toast.error("Selecione uma nota"); return }
    if (!userComment.trim()) { toast.error("Escreva um comentário"); return }
    setSubmittingReview(true)
    try {
      const { review: newReview, product: updated } = await createReview({
        productId: product.id, userId: user.id, userName: user.name, userAvatar: user.avatar,
        rating: userRating, comment: userComment.trim(),
      })
      setReviews((prev) => [newReview, ...prev])
      product.rating = updated.rating
      product.reviews = updated.reviews
      setUserRating(0)
      setUserComment("")
      toast.success("Avaliação enviada!")
    } catch { toast.error("Erro ao enviar avaliação") }
    finally { setSubmittingReview(false) }
  }

  const avgRating = product.rating
  const reviewCount = product.reviews

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-sans text-sm">Voltar</span>
            </Link>
            <span className="text-sm font-sans text-muted-foreground">TSARA</span>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square bg-secondary/30 rounded-2xl overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground">✦</div>
              )}
              {product.badge && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">
                  {product.badge}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <span className="text-xs tracking-wider uppercase text-primary font-sans">{product.category}</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-5 h-5", s <= Math.round(avgRating) ? "fill-gold text-gold" : "text-muted-foreground/30")} />
                ))}
              </div>
              <button onClick={loadReviews} className="text-sm font-sans text-muted-foreground hover:text-foreground underline cursor-pointer">
                {reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"}
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                {consultOnly ? "Sob consulta" : `R$ ${formatPrice(product.price)}`}
              </span>
              {!consultOnly && product.originalPrice ? (
                <span className="text-lg text-muted-foreground line-through font-sans">R$ {formatPrice(product.originalPrice)}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-4 text-sm font-sans text-muted-foreground flex-wrap">
              {consultOnly ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs">Consulte disponibilidade</span>
              ) : product.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-medium text-xs">Esgotado</span>
              ) : product.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-medium text-xs">Acabando ({product.stock} un.)</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium text-xs">Em estoque ({product.stock} un.)</span>
              )}
              <div className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {product.sold} vendidos</div>
            </div>

            <Button onClick={() => {
              if (consultOnly) {
                handleConsult()
                return
              }
              if (product.stock <= 0 || product.status === "inactive") {
                toast.error(`${product.name} está fora de estoque`)
                return
              }
              addItem(product); toast.success(`${product.name} adicionado ao carrinho!`)
            }}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-sans gap-2"
              disabled={unavailable}>
              {consultOnly ? <MessageCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />} {consultOnly ? "Consultar disponibilidade" : product.stock <= 0 ? "Esgotado" : "Adicionar ao Carrinho"}
            </Button>

            <div className="flex items-center gap-6 text-xs font-sans text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Entrega para todo Brasil</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Pagamento seguro</div>
            </div>

            {product.description && (
              <LiquidGlassCard className="p-6 py-6">
                <h3 className="font-semibold text-foreground mb-3">Descrição</h3>
                <ExpandableText
                  text={product.description}
                  lines={5}
                  threshold={360}
                  className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground font-sans"
                />
              </LiquidGlassCard>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8">Avaliações</h2>

          {user && (
            <Card className="bg-card border-border p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">Deixe sua avaliação</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setUserRating(s)} className="cursor-pointer">
                    <Star className={cn("w-7 h-7 transition-all", s <= userRating ? "fill-gold text-gold scale-110" : "text-muted-foreground/30 hover:text-gold/50")} />
                  </button>
                ))}
                {userRating > 0 && <span className="text-sm font-sans text-muted-foreground ml-2">{ratingLabels[userRating - 1]}</span>}
              </div>
              <Textarea value={userComment} onChange={(e) => setUserComment(e.target.value)}
                placeholder="Conte sua experiência com este produto..."
                className="font-sans bg-input/50 min-h-24 mb-4" />
              <Button onClick={handleSubmitReview} disabled={submittingReview} className="font-sans">
                {submittingReview ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </Card>
          )}

          {!reviewsLoaded ? (
            <button onClick={loadReviews} className="text-sm text-primary hover:underline font-sans cursor-pointer">
              Carregar avaliações
            </button>
          ) : reviews.length === 0 ? (
            <p className="text-sm font-sans text-muted-foreground text-center py-8">
              Nenhuma avaliação ainda. {user ? "Seja o primeiro!" : "Faça login para avaliar."}
            </p>
          ) : (
            <div className="space-y-4">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                  <Card key={review.id} className="bg-card border-border p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback className="text-[10px] font-bold text-primary bg-primary/20">{review.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{review.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-10">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "fill-gold text-gold" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-sans text-muted-foreground">
                      {review.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-muted-foreground leading-relaxed ml-10">{review.comment}</p>
                </Card>
              ))}
              {reviews.length > 3 && (
                <Button variant="outline" onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full font-sans">
                  {showAllReviews ? "Mostrar menos" : `Ver todas as ${reviews.length} avaliações`}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
