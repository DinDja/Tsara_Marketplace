"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Clock,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonStatsGrid, SkeletonTable } from "@/components/ui/data-skeleton";
import { useDashboardStats, useTopProducts, useRecentAppointments, useRecentOrders } from "@/lib/hooks";

export default function AdminDashboard() {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: topProducts, loading: topLoading } = useTopProducts();
  const { data: recentAppointments, loading: aptLoading } = useRecentAppointments();
  const { data: recentOrders, loading: ordersLoading } = useRecentOrders();

  const statCards = stats ? [
    { name: "Receita do Mês", value: `R$ ${stats.revenue.toLocaleString("pt-BR")}`, change: stats.revenueChange, trend: "up" as const, icon: DollarSign },
    { name: "Agendamentos", value: String(stats.appointments), change: stats.appointmentsChange, trend: "up" as const, icon: Calendar },
    { name: "Produtos Vendidos", value: String(stats.productsSold), change: stats.productsSoldChange, trend: "up" as const, icon: Package },
    { name: "Novos Clientes", value: String(stats.newClients), change: stats.newClientsChange, trend: "up" as const, icon: Users },
  ] : [];

  return (
    <div className="space-y-6">
      {statsLoading ? (
        <SkeletonStatsGrid />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    {stat.change && (
                      <div className="flex items-center gap-1 text-sm font-sans">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">{stat.change}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm font-sans text-muted-foreground mt-1">{stat.name}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-foreground">Próximos Agendamentos</CardTitle>
              <Button variant="ghost" size="sm" className="font-sans text-xs">Ver todos</Button>
            </CardHeader>
            <CardContent>
              {aptLoading ? (
                <SkeletonTable rows={4} cols={3} />
              ) : (
                <div className="space-y-4">
                  {recentAppointments?.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-sm">
                          {appointment.client.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{appointment.client}</p>
                          <p className="text-xs font-sans text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-sans text-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.date}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          appointment.status === "confirmed" ? "bg-green-500" :
                          appointment.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-foreground">Pedidos Recentes</CardTitle>
              <Button variant="ghost" size="sm" className="font-sans text-xs">Ver todos</Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <SkeletonTable rows={4} cols={3} />
              ) : (
                <div className="space-y-4">
                  {recentOrders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.id}</p>
                          <p className="text-xs font-sans text-muted-foreground">{order.client} · {order.items} itens</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-sans font-medium text-foreground">{order.total}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${
                          order.status === "delivered" ? "bg-green-500/10 text-green-500" :
                          order.status === "shipped" ? "bg-blue-500/10 text-blue-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {order.status === "delivered" ? "Entregue" :
                           order.status === "shipped" ? "Enviado" : "Processando"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">Produtos Mais Vendidos</CardTitle>
            <Button variant="ghost" size="sm" className="font-sans text-xs">Ver relatório</Button>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <SkeletonTable rows={4} cols={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Produto</th>
                      <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Vendas</th>
                      <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Receita</th>
                      <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts?.map((product, index) => (
                      <tr key={product.name} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-sm font-bold text-primary">{index + 1}</div>
                            <span className="text-sm font-medium text-foreground">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right"><span className="text-sm font-sans text-foreground">{product.sales} un.</span></td>
                        <td className="py-4 px-4 text-right"><span className="text-sm font-sans font-medium text-primary">{product.revenue}</span></td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="icon-sm">
                            <span className="sr-only">Ações</span>
                            <span className="block w-1 h-1 rounded-full bg-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 font-sans" asChild>
          <Link href="/admin/agendamentos">
            <Calendar className="w-6 h-6 text-primary" />
            <span>Novo Agendamento</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 font-sans" asChild>
          <Link href="/admin/produtos">
            <Package className="w-6 h-6 text-primary" />
            <span>Adicionar Produto</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 font-sans" asChild>
          <Link href="/admin/cupons">
            <Percent className="w-6 h-6 text-primary" />
            <span>Novo Cupom</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 font-sans" asChild>
          <Link href="/admin/clientes">
            <Users className="w-6 h-6 text-primary" />
            <span>Ver Clientes</span>
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
