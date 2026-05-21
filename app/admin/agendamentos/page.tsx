"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonAppointmentList } from "@/components/ui/data-skeleton";
import { useAppointments } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function AdminAgendamentos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { data: appointments, loading, refetch } = useAppointments();

  const filteredAppointments = (appointments || []).filter((apt) => {
    const matchesSearch = apt.client.toLowerCase().includes(searchQuery.toLowerCase()) || apt.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendente";
      case "cancelled": return "Cancelado";
      case "completed": return "Concluído";
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tarot": return "🃏";
      case "cigano": return "🔮";
      case "completa": return "✨";
      default: return "📅";
    }
  };

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const dayAppointments = (appointments || []).filter((apt) => apt.date === selectedDateStr);
  const slotMap = dayAppointments.reduce((acc, apt) => {
    acc[apt.time] = apt;
    return acc;
  }, {} as Record<string, (typeof appointments)[number]>);

  const handleAction = (action: string, client: string) => {
    const messages: Record<string, string> = {
      confirm: "Agendamento confirmado com sucesso!",
      reschedule: "Reagendamento enviado para o cliente.",
      cancel: "Agendamento cancelado.",
    };
    toast.success(messages[action] || "Ação realizada", { description: `Cliente: ${client}` });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie todos os agendamentos de consultas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} className="rounded-lg" />
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Horários - {selectedDate?.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                </h3>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = slotMap[time];
                    return (
                      <div key={time} className={cn("flex items-center gap-3 p-2 rounded-lg text-sm font-sans", appointment ? "bg-primary/10 border border-primary/20" : "bg-secondary/30")}>
                        <span className="w-12 text-muted-foreground">{time}</span>
                        {appointment ? (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-foreground font-medium">{appointment.client}</span>
                            <span className="text-xs">{getTypeIcon(appointment.type)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Disponível</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-foreground">Lista de Agendamentos</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 w-48 font-sans bg-input/50" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" /> Filtrar</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterStatus("all")}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("confirmed")}>Confirmados</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pendentes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelados</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Concluídos</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonAppointmentList />
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                            {getTypeIcon(appointment.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{appointment.client}</h3>
                              <Badge variant="outline" className={cn("text-xs font-sans", getStatusColor(appointment.status))}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>
                            <p className="text-sm font-sans text-muted-foreground mb-2">{appointment.typeName}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-muted-foreground">
                              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(appointment.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appointment.time}</span>
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {appointment.phone}</span>
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {appointment.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary">R$ {appointment.price}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => handleAction("confirm", appointment.client)}>
                                <CheckCircle className="w-4 h-4 text-green-500" /> Confirmar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleAction("reschedule", appointment.client)}>
                                <AlertCircle className="w-4 h-4 text-yellow-500" /> Remarcar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-500" onClick={() => handleAction("cancel", appointment.client)}>
                                <XCircle className="w-4 h-4" /> Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-sans text-muted-foreground"><span className="font-medium">Obs:</span> {appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
