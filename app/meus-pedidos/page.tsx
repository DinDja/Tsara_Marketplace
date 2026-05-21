"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingBag, Loader2, MapPin } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/contexts/auth-context"
import { getOrdersByClient } from "@/lib/services"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types"

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendente", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  processing: { label: "Processando", class: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  shipped: { label: "Enviado", class: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  delivered: { label: "Entregue", class: "bg-green-500/10 text-green-500 border-green-500/30" },
  cancelled: { label: "Cancelado", class: "bg-red-500/10 text-red-500 border-red-500/30" },
}

export default function MeusPedidos() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return }
    if (user) {
      getOrdersByClient(user.id).then(setOrders).finally(() => setLoadingData(false))
    }
  }, [user, loading, router])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/conta" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="font-sans text-sm">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" /><span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Meus Pedidos</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">Nenhum pedido realizado</p>
              <p className="text-sm font-sans text-muted-foreground mb-6">Explore nossos produtos místicos e faça seu primeiro pedido</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/#produtos">Explorar Produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const cfg = statusConfig[order.status] || statusConfig.pending
                return (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-card border-border hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-foreground">Pedido #{order.id.slice(0, 8)}</h3>
                              <Badge variant="outline" className={cn("text-xs font-sans", cfg.class)}>{cfg.label}</Badge>
                            </div>
                            <p className="text-sm font-sans text-muted-foreground">{order.items.length} {order.items.length === 1 ? "item" : "itens"}</p>
                            {order.items.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {order.items.slice(0, 3).map((item) => (
                                  <span key={item.productId} className="text-xs font-sans bg-secondary/50 px-2 py-1 rounded text-muted-foreground truncate max-w-32">{item.name}</span>
                                ))}
                                {order.items.length > 3 && <span className="text-xs font-sans text-muted-foreground">+{order.items.length - 3}</span>}
                              </div>
                            )}
                            <p className="text-xs font-sans text-muted-foreground mt-2">{order.createdAt.toLocaleDateString("pt-BR")}</p>
                            {order.shippingAddress && (
                              <p className="text-xs font-sans text-muted-foreground/60 mt-1 truncate max-w-xs">
                                <MapPin className="w-3 h-3 inline mr-1" />{order.shippingAddress}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-primary">R$ {order.total.toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
