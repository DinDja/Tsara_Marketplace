"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, Loader2, MapPin, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CreditCard, Banknote, Truck, CheckCircle2, Clock, XCircle, ArrowLeft, RotateCcw, HelpCircle, Download } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/contexts/auth-context"
import { useOrdersByClientPaginated } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types"

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pending: { label: "Pendente", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", icon: Clock },
  processing: { label: "Processando", class: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Package },
  shipped: { label: "Enviado", class: "bg-purple-500/10 text-purple-500 border-purple-500/30", icon: Truck },
  delivered: { label: "Entregue", class: "bg-green-500/10 text-green-500 border-green-500/30", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", class: "bg-red-500/10 text-red-500 border-red-500/30", icon: XCircle },
}

const statusSteps = ["pending", "processing", "shipped", "delivered"]

function formatCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`
}

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

export default function MeusPedidos() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const ordersHook = useOrdersByClientPaginated(user?.id ?? "", 10)
  const { data: orders, loading: loadingData, page, total, hasMore, goToPage, setPage } = ordersHook
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return }
  }, [user, loading, router])

  useEffect(() => {
    setPage(1)
  }, [activeTab, setPage])

  const tabs = [
    { key: "all", label: "Todos", count: total },
    ...statusSteps.map((s) => ({
      key: s,
      label: statusConfig[s].label,
      count: orders.filter((o) => o.status === s).length,
    })),
    { key: "cancelled", label: "Cancelados", count: orders.filter((o) => o.status === "cancelled").length },
  ]

  const filtered = orders.filter((o) => {
    if (activeTab !== "all" && o.status !== activeTab) return false
    if (!search) return true
    const q = search.toLowerCase()
    return o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q))
  })

  const totalSpent = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Meus Pedidos</h1>
              <p className="text-sm font-sans text-muted-foreground mt-1">
                {total} {total === 1 ? "pedido realizado" : "pedidos realizados"}
                {totalSpent > 0 && ` \u2022 ${formatCurrency(totalSpent)} em entregues`}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID, produto..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-sans bg-input/50" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans whitespace-nowrap transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}>
                {tab.label}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
                )}>{tab.count}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">
                {search ? "Nenhum pedido encontrado" : "Nenhum pedido realizado"}
              </p>
              <p className="text-sm font-sans text-muted-foreground mb-6">
                {search ? "Tente outro termo de busca" : "Explore nossos produtos místicos e faça seu primeiro pedido"}
              </p>
              {!search && <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/#produtos">Explorar Produtos</Link>
              </Button>}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((order, i) => {
                const cfg = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = cfg.icon
                const isExpanded = expandedId === order.id
                const stepIndex = statusSteps.indexOf(order.status)

                return (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className={cn(
                      "bg-card border-border transition-all",
                      isExpanded ? "border-primary/40 shadow-lg shadow-primary/5" : "hover:border-primary/20"
                    )}>
                      <CardContent className="p-0">
                        <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="w-full text-left p-5 sm:p-6 flex items-start gap-4 hover:bg-secondary/10 transition-colors">
                          <div className={cn("p-2.5 rounded-xl shrink-0", cfg.class.replace("border-", "border/0 "))}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="text-base font-semibold text-foreground">Pedido #{order.id.slice(0, 8)}</h3>
                              <Badge variant="outline" className={cn("text-[10px] font-sans", cfg.class)}>{cfg.label}</Badge>
                            </div>
                            <p className="text-sm font-sans text-muted-foreground">{order.items.length} {order.items.length === 1 ? "item" : "itens"} &bull; {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-lg font-bold text-foreground">{formatCurrency(order.total)}</p>
                            {order.status === "delivered" && (
                              <p className="text-[10px] font-sans text-green-500 mt-0.5">Entregue</p>
                            )}
                          </div>
                          <div className="shrink-0 text-muted-foreground mt-1">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                              className="overflow-hidden border-t border-border">
                              <div className="p-5 sm:p-6 space-y-6">

                                {order.status !== "cancelled" && (
                                  <div>
                                    <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-3">Andamento do pedido</p>
                                    <div className="flex items-start gap-1">
                                      {statusSteps.map((step, idx) => {
                                        const stepCfg = statusConfig[step]
                                        const StepIcon = stepCfg.icon
                                        const done = idx <= stepIndex
                                        const current = idx === stepIndex
                                        return (
                                          <div key={step} className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                              <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                                                done ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-secondary/50 text-muted-foreground"
                                              )}>
                                                {done ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                                              </div>
                                              {idx < statusSteps.length - 1 && (
                                                <div className={cn(
                                                  "h-0.5 flex-1 mx-1.5 rounded-full",
                                                  idx < stepIndex ? "bg-primary/60" : "bg-border"
                                                )} />
                                              )}
                                            </div>
                                            <p className={cn(
                                              "text-[10px] font-sans mt-1.5 truncate",
                                              current ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground"
                                            )}>{stepCfg.label}</p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Pedido</p>
                                    <p className="text-sm font-mono text-foreground">#{order.id.slice(0, 8)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Data</p>
                                    <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Pagamento</p>
                                    <p className="text-sm text-foreground flex items-center gap-1">
                                      {order.captureMethod === "pix" ? (
                                        <><Banknote className="w-3.5 h-3.5 text-green-500" /> Pix</>
                                      ) : order.captureMethod === "credit" ? (
                                        <><CreditCard className="w-3.5 h-3.5 text-primary" /> Cartão</>
                                      ) : (
                                        order.paymentMethod || "—"
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">Total</p>
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-3">Itens</p>
                                  <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 p-3 hover:bg-secondary/10 transition-colors">
                                        {item.image && (
                                          <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary/30" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                          <p className="text-[11px] font-sans text-muted-foreground">{item.category}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <p className="text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                                          <p className="text-[11px] font-sans text-muted-foreground">Qtd: {item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-xl bg-secondary/20 p-4 space-y-2">
                                  <div className="flex justify-between text-sm font-sans text-muted-foreground">
                                    <span>Subtotal dos itens</span><span>{formatCurrency(order.subtotal)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-sm font-sans text-green-500">
                                      <span>Desconto{order.coupon ? ` (${order.coupon})` : ""}</span><span>-{formatCurrency(order.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm font-sans text-muted-foreground">
                                    <span>Frete</span><span>{order.shipping > 0 ? formatCurrency(order.shipping) : "Grátis"}</span>
                                  </div>
                                  <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
                                    <span>Total</span><span>{formatCurrency(order.total)}</span>
                                  </div>
                                </div>

                                {order.shippingAddress && (
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-0.5">Endereço de entrega</p>
                                      <p className="text-sm text-foreground">{order.shippingAddress}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-1">
                                  {order.status === "delivered" && (
                                    <Button size="sm" variant="outline" className="font-sans text-xs gap-1.5" asChild>
                                      <Link href={`/produto/${order.items[0]?.productId}`}><RotateCcw className="w-3.5 h-3.5" /> Comprar novamente</Link>
                                    </Button>
                                  )}
                                  {order.status === "processing" && (
                                    <Button size="sm" variant="outline" className="font-sans text-xs gap-1.5">
                                      <Truck className="w-3.5 h-3.5" /> Rastrear pedido
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="font-sans text-xs gap-1.5 text-muted-foreground">
                                    <HelpCircle className="w-3.5 h-3.5" /> Ajuda
                                  </Button>
                                  <Button size="sm" variant="ghost" className="font-sans text-xs gap-1.5 text-muted-foreground">
                                    <Download className="w-3.5 h-3.5" /> Nota Fiscal
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1 || loadingData} className="gap-1 font-sans">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <span className="px-4 text-sm font-sans text-muted-foreground">
                Pagina {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={!hasMore || loadingData} className="gap-1 font-sans">
                Proximo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
