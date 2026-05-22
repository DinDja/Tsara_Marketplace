"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar as CalendarIcon, Clock, Search, Filter, Plus, MoreVertical,
  CheckCircle, XCircle, AlertCircle, Phone, Mail, User, Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkeletonAppointmentList } from "@/components/ui/data-skeleton"
import { useAppointments } from "@/lib/hooks"
import { createAppointment, updateAppointmentStatus, deleteAppointment } from "@/lib/services"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
const consultationTypes = [
  { value: "tarot", label: "Tarot Terapêutico" },
  { value: "cigano", label: "Baralho Cigano" },
  { value: "completa", label: "Sessão Completa" },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  completed: { label: "Concluído", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
}

export default function AdminAgendamentos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { data: appointments, loading, refetch } = useAppointments()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client: "", email: "", phone: "", type: "tarot", date: "", time: "", notes: "",
  })

  const filteredAppointments = (appointments || []).filter((apt) => {
    const matchesSearch = apt.client.toLowerCase().includes(searchQuery.toLowerCase()) || apt.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const resetForm = () => setForm({ client: "", email: "", phone: "", type: "tarot", date: "", time: "", notes: "" })

  const handleCreate = async () => {
    if (!form.client || !form.email || !form.phone || !form.date || !form.time) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    setSaving(true)
    try {
      const typeLabel = consultationTypes.find((t) => t.value === form.type)?.label || form.type
      const priceMap: Record<string, number> = { tarot: 180, cigano: 150, completa: 280 }
      await createAppointment({
        client: form.client, email: form.email, phone: form.phone,
        type: form.type, typeName: typeLabel,
        date: form.date, time: form.time, status: "pending",
        price: priceMap[form.type] || 0,
        notes: form.notes || undefined,
      })
      toast.success("Agendamento criado!")
      setDialogOpen(false)
      resetForm()
      refetch()
    } catch {
      toast.error("Erro ao criar agendamento")
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string, clientName: string) => {
    try {
      await updateAppointmentStatus(id, status as any)
      toast.success(
        status === "completed" ? "Agendamento concluído!" :
        status === "confirmed" ? "Agendamento confirmado!" :
        status === "cancelled" ? "Agendamento cancelado." :
        "Status atualizado!",
        { description: `Cliente: ${clientName}` }
      )
      refetch()
    } catch {
      toast.error("Erro ao atualizar status")
    }
  }

  const handleDelete = async (id: string, clientName: string) => {
    try {
      await deleteAppointment(id)
      toast.success("Agendamento removido", { description: `Cliente: ${clientName}` })
      refetch()
    } catch {
      toast.error("Erro ao remover agendamento")
    }
  }

  const selectedDateStr = selectedDate?.toISOString().split("T")[0]
  const dayAppointments = (appointments || []).filter((apt) => apt.date === selectedDateStr)
  const slotMap = dayAppointments.reduce((acc, apt) => {
    acc[apt.time] = apt
    return acc
  }, {} as Record<string, (typeof appointments)[number]>)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tarot": return "🃏"
      case "cigano": return "🔮"
      case "completa": return "✨"
      default: return "📅"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie todos os agendamentos de consultas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 font-sans gap-2">
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
                    const appointment = slotMap[time]
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
                    )
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
                      <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Concluídos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelados</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonAppointmentList />
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                  Nenhum agendamento encontrado
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => {
                    const cfg = statusConfig[appointment.status] || statusConfig.pending
                    return (
                      <div key={appointment.id} className="p-4 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                              {getTypeIcon(appointment.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{appointment.client}</h3>
                                <Badge variant="outline" className={cn("text-xs font-sans", cfg.color)}>
                                  {cfg.label}
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
                                {appointment.status !== "confirmed" && appointment.status !== "completed" && (
                                  <DropdownMenuItem className="gap-2" onClick={() => handleStatusUpdate(appointment.id, "confirmed", appointment.client)}>
                                    <CheckCircle className="w-4 h-4 text-green-500" /> Confirmar
                                  </DropdownMenuItem>
                                )}
                                {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                                  <DropdownMenuItem className="gap-2" onClick={() => handleStatusUpdate(appointment.id, "completed", appointment.client)}>
                                    <CheckCircle className="w-4 h-4 text-blue-500" /> Concluir
                                  </DropdownMenuItem>
                                )}
                                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                  <DropdownMenuItem className="gap-2 text-red-500" onClick={() => handleStatusUpdate(appointment.id, "cancelled", appointment.client)}>
                                    <XCircle className="w-4 h-4" /> Cancelar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="gap-2 text-red-500/60" onClick={() => handleDelete(appointment.id, appointment.client)}>
                                  <XCircle className="w-4 h-4" /> Remover
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
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) { setDialogOpen(false); resetForm() } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription className="font-sans">Preencha os dados para criar um agendamento manualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-sans">Cliente *</Label>
              <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}
                placeholder="Nome do cliente" className="font-sans bg-input/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-sans">E-mail *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com" className="font-sans bg-input/50" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Telefone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(71) 99999-9999" className="font-sans bg-input/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-sans">Tipo de Consulta *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="font-sans bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {consultationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-sans">Data *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="font-sans bg-input/50" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Horário *</Label>
                <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
                  <SelectTrigger className="font-sans bg-input/50">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-sans">Observações</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observações sobre o agendamento" className="font-sans bg-input/50" />
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full bg-primary hover:bg-primary/90 font-sans">
              {saving ? "Salvando..." : "Criar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
