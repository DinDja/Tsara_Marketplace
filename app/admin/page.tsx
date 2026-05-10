"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    name: "Receita do Mês",
    value: "R$ 12.480",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
  },
  {
    name: "Agendamentos",
    value: "48",
    change: "+8%",
    trend: "up",
    icon: Calendar,
  },
  {
    name: "Produtos Vendidos",
    value: "156",
    change: "+23%",
    trend: "up",
    icon: Package,
  },
  {
    name: "Novos Clientes",
    value: "32",
    change: "+5%",
    trend: "up",
    icon: Users,
  },
];

const recentAppointments = [
  {
    id: 1,
    client: "Maria Silva",
    type: "Tarot",
    date: "Hoje, 14:00",
    status: "confirmed",
  },
  {
    id: 2,
    client: "João Santos",
    type: "Baralho Cigano",
    date: "Hoje, 15:30",
    status: "pending",
  },
  {
    id: 3,
    client: "Ana Costa",
    type: "Sessão Completa",
    date: "Amanhã, 10:00",
    status: "confirmed",
  },
  {
    id: 4,
    client: "Pedro Lima",
    type: "Tarot",
    date: "Amanhã, 14:00",
    status: "confirmed",
  },
  {
    id: 5,
    client: "Carla Oliveira",
    type: "Baralho Cigano",
    date: "12/05, 11:00",
    status: "cancelled",
  },
];

const recentOrders = [
  {
    id: "#1234",
    client: "Fernanda Alves",
    total: "R$ 189,90",
    items: 3,
    status: "delivered",
  },
  {
    id: "#1233",
    client: "Lucas Mendes",
    total: "R$ 89,90",
    items: 1,
    status: "shipped",
  },
  {
    id: "#1232",
    client: "Beatriz Rosa",
    total: "R$ 254,70",
    items: 4,
    status: "processing",
  },
  {
    id: "#1231",
    client: "Ricardo Souza",
    total: "R$ 129,90",
    items: 2,
    status: "delivered",
  },
];

const topProducts = [
  { name: "Cristal Ametista Bruta", sales: 45, revenue: "R$ 4.045" },
  { name: "Kit 7 Velas Energizadas", sales: 38, revenue: "R$ 2.086" },
  { name: "Baralho Cigano Tradicional", sales: 32, revenue: "R$ 4.157" },
  { name: "Incenso 7 Ervas (cx 50)", sales: 28, revenue: "R$ 756" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                  <div className="flex items-center gap-1 text-sm font-sans">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm font-sans text-muted-foreground mt-1">
                    {stat.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-foreground">
                Próximos Agendamentos
              </CardTitle>
              <Button variant="ghost" size="sm" className="font-sans text-xs">
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-sm">
                        {appointment.client
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {appointment.client}
                        </p>
                        <p className="text-xs font-sans text-muted-foreground">
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-sans text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.date}
                        </p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-green-500"
                            : appointment.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-foreground">
                Pedidos Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" className="font-sans text-xs">
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.id}
                        </p>
                        <p className="text-xs font-sans text-muted-foreground">
                          {order.client} · {order.items} itens
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-sans font-medium text-foreground">
                        {order.total}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${
                          order.status === "delivered"
                            ? "bg-green-500/10 text-green-500"
                            : order.status === "shipped"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {order.status === "delivered"
                          ? "Entregue"
                          : order.status === "shipped"
                          ? "Enviado"
                          : "Processando"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Produtos Mais Vendidos
            </CardTitle>
            <Button variant="ghost" size="sm" className="font-sans text-xs">
              Ver relatório
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Vendas
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Receita
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.name}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-sans text-foreground">
                          {product.sales} un.
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-sans font-medium text-primary">
                          {product.revenue}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 font-sans"
        >
          <Calendar className="w-6 h-6 text-primary" />
          <span>Novo Agendamento</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 font-sans"
        >
          <Package className="w-6 h-6 text-primary" />
          <span>Adicionar Produto</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 font-sans"
        >
          <Users className="w-6 h-6 text-primary" />
          <span>Cadastrar Cliente</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 font-sans"
        >
          <DollarSign className="w-6 h-6 text-primary" />
          <span>Gerar Relatório</span>
        </Button>
      </motion.div>
    </div>
  );
}
