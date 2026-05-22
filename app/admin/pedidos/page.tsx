"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search, ShoppingCart, Clock, Package, Truck, CheckCircle2, XCircle, DollarSign,
  Eye, MoreVertical, TrendingUp, AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkeletonTable, SkeletonStatsGrid } from "@/components/ui/data-skeleton"
import { useOrders } from "@/lib/hooks"
import { updateOrder } from "@/lib/services"
import { toast } from "sonner"
import type { Order } from "@/lib/types"

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  processing: { label: "Processando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  delivered: { label: "Entregue", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"]

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`
}

export default function AdminPedidos() {
  const { data: orders, loading, refetch } = useOrders()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)

  const filtered = (orders || []).filter((o) => {
    const matchSearch = o.client.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = orders ? [
    { name: "Total", value: String(orders.length), icon: ShoppingCart, color: "text-primary" },
    { name: "Pendentes", value: String(orders.filter((o) => o.status === "pending").length), icon: Clock, color: "text-yellow-500" },
    { name: "Processando", value: String(orders.filter((o) => o.status === "processing").length), icon: Package, color: "text-blue-500" },
    { name: "Enviados", value: String(orders.filter((o) => o.status === "shipped").length), icon: Truck, color: "text-purple-500" },
    { name: "Entregues", value: String(orders.filter((o) => o.status === "delivered").length), icon: CheckCircle2, color: "text-green-500" },
    { name: "Cancelados", value: String(orders.filter((o) => o.status === "cancelled").length), icon: XCircle, color: "text-red-500" },
    { name: "Receita", value: formatCurrency(orders.reduce((s, o) => s + (o.status === "delivered" ? o.total : 0), 0)), icon: DollarSign, color: "text-emerald-500" },
  ] : []

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as Order["status"] })
      toast.success("Status atualizado!")
      refetch()
    } catch {
      toast.error("Erro ao atualizar status")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-sm font-sans text-muted-foreground">Gerencie todos os pedidos da loja</p>
      </div>

      {loading ? (
        <SkeletonStatsGrid count={7} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-sans text-muted-foreground truncate">{stat.name}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por cliente ou ID..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-sans bg-input/50" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 font-sans bg-input/50">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{statusConfig[s]?.label || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">Nenhum pedido encontrado</p>
            <p className="text-sm font-sans text-muted-foreground">{search ? "Tente outro termo de busca" : "Ainda não há pedidos cadastrados"}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pedido</th>
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Itens</th>
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Data</th>
                  <th className="text-right text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-foreground">#{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{order.client}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-sans text-muted-foreground">{order.items.length} {order.items.length === 1 ? "item" : "itens"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] font-sans ${status.color}`}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-sans text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setDetailOrder(order)}
                            className="w-8 h-8 text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              {statusOptions.filter((s) => s !== order.status).map((s) => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(order.id, s)}
                                  className="font-sans text-sm gap-2 cursor-pointer">
                                  {s === "pending" && <Clock className="w-3.5 h-3.5" />}
                                  {s === "processing" && <Package className="w-3.5 h-3.5" />}
                                  {s === "shipped" && <Truck className="w-3.5 h-3.5" />}
                                  {s === "delivered" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  {s === "cancelled" && <XCircle className="w-3.5 h-3.5" />}
                                  {statusConfig[s]?.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!detailOrder} onOpenChange={(v) => { if (!v) setDetailOrder(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{detailOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription className="font-sans">Detalhes completos do pedido</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-sans text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium text-foreground">{detailOrder.client}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-sans text-muted-foreground">Data</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(detailOrder.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-sans text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`text-[10px] font-sans ${statusConfig[detailOrder.status]?.color}`}>
                    {statusConfig[detailOrder.status]?.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-sans text-muted-foreground">Pagamento</p>
                  <p className="text-sm font-medium text-foreground">{detailOrder.paymentMethod || "—"}</p>
                </div>
                {detailOrder.captureMethod && (
                  <div className="space-y-1">
                    <p className="text-xs font-sans text-muted-foreground">Método de captura</p>
                    <p className="text-sm font-medium text-foreground">{detailOrder.captureMethod === "pix" ? "PIX" : "Cartão de Crédito"}</p>
                  </div>
                )}
                {detailOrder.paidAmount !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs font-sans text-muted-foreground">Valor pago</p>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(detailOrder.paidAmount / 100)}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-sans text-muted-foreground mb-2 uppercase tracking-wider">Endereço de entrega</p>
                <p className="text-sm text-foreground font-sans">{detailOrder.shippingAddress || "—"}</p>
              </div>

              <div>
                <p className="text-xs font-sans text-muted-foreground mb-2 uppercase tracking-wider">Itens</p>
                <div className="space-y-2">
                  {detailOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs font-sans text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-medium text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs font-sans text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm font-sans text-muted-foreground">
                  <span>Subtotal</span><span>{formatCurrency(detailOrder.subtotal)}</span>
                </div>
                {detailOrder.discount > 0 && (
                  <div className="flex justify-between text-sm font-sans text-green-500">
                    <span>Desconto</span><span>-{formatCurrency(detailOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-sans text-muted-foreground">
                  <span>Frete</span><span>{detailOrder.shipping > 0 ? formatCurrency(detailOrder.shipping) : "Grátis"}</span>
                </div>
                {detailOrder.coupon && (
                  <div className="flex justify-between text-sm font-sans text-muted-foreground">
                    <span>Cupom</span><span>{detailOrder.coupon}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span><span>{formatCurrency(detailOrder.total)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {statusOptions.filter((s) => s !== detailOrder.status).map((s) => (
                  <Button key={s} size="sm" variant="outline" className="font-sans text-xs"
                    onClick={() => { handleStatusChange(detailOrder.id, s); setDetailOrder(null) }}>
                    {s === "pending" && <Clock className="w-3 h-3 mr-1" />}
                    {s === "processing" && <Package className="w-3 h-3 mr-1" />}
                    {s === "shipped" && <Truck className="w-3 h-3 mr-1" />}
                    {s === "delivered" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {s === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                    Marcar como {statusConfig[s]?.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border" />
}
