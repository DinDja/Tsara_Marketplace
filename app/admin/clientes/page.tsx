"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  Edit,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonClientCards, SkeletonStatsGrid } from "@/components/ui/data-skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useClients } from "@/lib/hooks";
import { toast } from "sonner";

export default function AdminClientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: clients, loading } = useClients();

  const filteredClients = (clients || []).filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalClients = clients?.length || 0;
  const vipClients = clients?.filter((c) => c.vip).length || 0;
  const totalRevenue = clients?.reduce((acc, c) => acc + c.totalSpent, 0) || 0;
  const avgSpent = totalClients > 0 ? totalRevenue / totalClients : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {loading ? (
        <SkeletonStatsGrid />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total de Clientes", value: totalClients, icon: Users },
            { label: "Clientes VIP", value: vipClients, icon: Star },
            { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(0)}`, icon: ShoppingBag },
            { label: "Ticket Médio", value: `R$ ${avgSpent.toFixed(0)}`, icon: ShoppingBag },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs font-sans text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 font-sans bg-input/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {loading ? (
          <SkeletonClientCards />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback className="text-sm font-bold text-primary bg-primary/10">
                            {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          {client.vip && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-xs font-sans text-muted-foreground">Cliente desde {client.createdAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-500"><Trash2 className="w-4 h-4" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                      <Mail className="w-4 h-4" /> {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                      <Phone className="w-4 h-4" /> {client.phone}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{client.totalAppointments}</p>
                      <p className="text-xs font-sans text-muted-foreground">Consultas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{client.totalOrders}</p>
                      <p className="text-xs font-sans text-muted-foreground">Pedidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">R$ {client.totalSpent.toFixed(0)}</p>
                      <p className="text-xs font-sans text-muted-foreground">Total</p>
                    </div>
                  </div>

                  {client.lastActivity && (
                    <p className="text-xs font-sans text-muted-foreground mt-4 text-center">
                      Última atividade: {client.lastActivity}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
