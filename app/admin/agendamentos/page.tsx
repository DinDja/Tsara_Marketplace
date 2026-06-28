"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SkeletonAppointmentList } from "@/components/ui/data-skeleton"
import { EmptyScheduleState, ScheduleStatusBadge } from "@/components/scheduling"
import { useAppointments } from "@/lib/hooks"
import {
  createAppointment,
  deleteAppointment,
  getConsultationTypes,
  getOccupiedSlots,
  updateAppointmentStatus,
} from "@/lib/services"
import type { ConsultationType } from "@/lib/services/consultations"
import type { Appointment } from "@/lib/types"
import { TIME_SLOTS } from "@/lib/constants"
import { cn, formatPrice } from "@/lib/utils"

const statusLabels: Record<Appointment["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluido",
}

const emptyForm = {
  client: "",
  email: "",
  phone: "",
  type: "",
  date: "",
  time: "",
  message: "",
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function appointmentDateTime(appointment: Appointment) {
  return new Date(`${appointment.date}T${appointment.time}`).getTime()
}

function formatDisplayDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

export default function AdminAgendamentosPage() {
  const { data, loading, refetch } = useAppointments()
  const appointments = data ?? []

  const [types, setTypes] = useState<ConsultationType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | "all">("all")
  const [filterType, setFilterType] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const selectedDateKey = toDateKey(selectedDate)
  const todayKey = toDateKey(new Date())

  useEffect(() => {
    let mounted = true

    async function loadTypes() {
      setLoadingTypes(true)
      try {
        const result = await getConsultationTypes()
        if (!mounted) return
        setTypes(result)
        setForm((current) => ({
          ...current,
          type: current.type || result[0]?.id || "",
          date: current.date || toDateKey(new Date()),
        }))
      } catch {
        toast.error("Nao foi possivel carregar os tipos de consulta")
      } finally {
        if (mounted) setLoadingTypes(false)
      }
    }

    loadTypes()
    return () => {
      mounted = false
    }
  }, [])

  const filteredAppointments = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    return appointments
      .filter((appointment) => {
        const matchesSearch =
          !term ||
          appointment.client.toLowerCase().includes(term) ||
          appointment.email.toLowerCase().includes(term) ||
          appointment.phone.toLowerCase().includes(term) ||
          appointment.typeName.toLowerCase().includes(term)

        const matchesStatus = filterStatus === "all" || appointment.status === filterStatus
        const matchesType = filterType === "all" || appointment.type === filterType
        const matchesDate = !filterDate || appointment.date === filterDate

        return matchesSearch && matchesStatus && matchesType && matchesDate
      })
      .sort((a, b) => appointmentDateTime(a) - appointmentDateTime(b))
  }, [appointments, filterDate, filterStatus, filterType, searchQuery])

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === selectedDateKey)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDateKey],
  )

  const slotMap = useMemo(() => {
    const map = new Map<string, Appointment>()
    dayAppointments
      .filter((appointment) => appointment.status === "pending" || appointment.status === "confirmed")
      .forEach((appointment) => map.set(appointment.time, appointment))
    return map
  }, [dayAppointments])

  const todayAppointments = appointments.filter((appointment) => appointment.date === todayKey)
  const pendingCount = appointments.filter((appointment) => appointment.status === "pending").length
  const confirmedCount = appointments.filter((appointment) => appointment.status === "confirmed").length
  const todayRevenue = todayAppointments
    .filter((appointment) => appointment.status !== "cancelled")
    .reduce((sum, appointment) => sum + appointment.price, 0)

  const selectedFormType = types.find((type) => type.id === form.type)

  function openCreateDialog() {
    setForm({
      ...emptyForm,
      type: types[0]?.id || "",
      date: selectedDateKey,
    })
    setDialogOpen(true)
  }

  async function handleCreateAppointment() {
    if (!form.client.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Preencha nome, email e telefone")
      return
    }

    if (!selectedFormType || !form.date || !form.time) {
      toast.error("Selecione tipo, data e horario")
      return
    }

    setSaving(true)
    try {
      const occupiedSlots = await getOccupiedSlots(form.date)
      if (occupiedSlots.includes(form.time)) {
        toast.error("Esse horario ja esta ocupado")
        return
      }

      await createAppointment({
        client: form.client.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        type: selectedFormType.id,
        typeName: selectedFormType.name,
        date: form.date,
        time: form.time,
        status: "confirmed",
        price: selectedFormType.price,
        message: form.message.trim() || undefined,
      })

      toast.success("Agendamento criado")
      setDialogOpen(false)
      await refetch()
    } catch (error) {
      if (error instanceof Error && error.message === "slot-unavailable") {
        toast.error("Esse horario acabou de ser reservado")
      } else {
        toast.error("Nao foi possivel criar o agendamento")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate(id: string, status: Appointment["status"]) {
    try {
      await updateAppointmentStatus(id, status)
      toast.success(`Status alterado para ${statusLabels[status].toLowerCase()}`)
      await refetch()
    } catch {
      toast.error("Nao foi possivel atualizar o status")
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Remover este agendamento definitivamente?")
    if (!confirmed) return

    try {
      await deleteAppointment(id)
      toast.success("Agendamento removido")
      await refetch()
    } catch {
      toast.error("Nao foi possivel remover o agendamento")
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Agenda</p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Agendamentos</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Visualize a agenda, acompanhe status e crie reservas manuais sem sair do fluxo real do Firestore.
            </p>
          </div>
        </div>

        <Button onClick={openCreateDialog} disabled={loadingTypes}>
          <Plus className="size-4" />
          Novo agendamento
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarDays}
          label="Hoje"
          value={String(todayAppointments.length)}
          detail={`${todayAppointments.filter((appointment) => appointment.status === "confirmed").length} confirmados`}
        />
        <MetricCard icon={AlertCircle} label="Pendentes" value={String(pendingCount)} detail="Aguardando confirmacao" />
        <MetricCard icon={CheckCircle2} label="Confirmados" value={String(confirmedCount)} detail="Horarios bloqueados" />
        <MetricCard icon={DollarSign} label="Receita hoje" value={`R$ ${formatPrice(todayRevenue)}`} detail="Exceto cancelados" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <LiquidGlassCard className="py-6">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Escolha um dia para ver ocupacao por horario.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                disabled={{ before: startOfToday() }}
                className="mx-auto"
              />
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard className="py-6">
            <CardHeader>
              <CardTitle>{formatDisplayDate(selectedDateKey)}</CardTitle>
              <CardDescription>{dayAppointments.length} agendamentos neste dia.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TIME_SLOTS.map((time) => {
                  const appointment = slotMap.get(time)
                  const occupied = Boolean(appointment)

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        if (!occupied) {
                          setForm({
                            ...emptyForm,
                            type: types[0]?.id || "",
                            date: selectedDateKey,
                            time,
                          })
                          setDialogOpen(true)
                        }
                      }}
                      className={cn(
                        "min-h-[82px] rounded-md border p-3 text-left transition-colors",
                        occupied
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50",
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Clock className="size-4" />
                        {time}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {appointment ? appointment.client : "Livre para agendar"}
                      </p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard className="py-6">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Lista de agendamentos</CardTitle>
                <CardDescription>Filtre por cliente, status, tipo ou data.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => refetch()} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
                Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar cliente, email ou telefone"
                  className="pl-9"
                />
              </div>

              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Appointment["status"] | "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluidos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
            </div>

            {loading ? (
              <SkeletonAppointmentList count={5} />
            ) : filteredAppointments.length === 0 ? (
              <EmptyScheduleState
                title="Nenhum agendamento encontrado"
                description="Ajuste os filtros ou crie um novo horario manualmente."
                actionLabel="Criar agendamento"
                onAction={openCreateDialog}
              />
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </LiquidGlassCard>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo agendamento</DialogTitle>
            <DialogDescription>Crie uma reserva manual usando os mesmos tipos e regras do fluxo publico.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={form.client}
                onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tipo de consulta</Label>
              <Select
                value={form.type || undefined}
                onValueChange={(value) => setForm((current) => ({ ...current, type: value }))}
                disabled={loadingTypes || types.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma consulta" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.duration} - R$ {formatPrice(type.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                min={todayKey}
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={form.time || undefined} onValueChange={(value) => setForm((current) => ({ ...current, time: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message">Observacoes internas</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Contexto do atendimento, combinado pelo WhatsApp, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment} disabled={saving || loadingTypes || types.length === 0}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Criar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type MetricCardProps = {
  icon: LucideIcon
  label: string
  value: string
  detail: string
}

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <LiquidGlassCard className="py-6">
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </LiquidGlassCard>
  )
}

type AppointmentRowProps = {
  appointment: Appointment
  onStatusUpdate: (id: string, status: Appointment["status"]) => void
  onDelete: (id: string) => void
}

function AppointmentRow({ appointment, onStatusUpdate, onDelete }: AppointmentRowProps) {
  return (
    <LiquidGlassCard className="min-h-[168px] p-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <User className="size-5" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{appointment.client}</h3>
              <ScheduleStatusBadge status={appointment.status} />
            </div>
            <p className="text-sm text-muted-foreground">{appointment.typeName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDisplayDate(appointment.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {appointment.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                {appointment.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3.5" />
                {appointment.email}
              </span>
            </div>
            {(appointment.message || appointment.notes) && (
              <div className="rounded-md border border-white/10 bg-secondary/40 px-3 py-2 text-muted-foreground">
                <ExpandableText
                  text={appointment.message || appointment.notes}
                  lines={2}
                  threshold={120}
                  className="text-sm leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
          <p className="text-sm font-semibold text-foreground">R$ {formatPrice(appointment.price)}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Acoes do agendamento">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onStatusUpdate(appointment.id, "confirmed")}>
                <CheckCircle2 className="size-4" />
                Confirmar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate(appointment.id, "completed")}>
                <CalendarCheck className="size-4" />
                Concluir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate(appointment.id, "cancelled")}>
                <XCircle className="size-4" />
                Cancelar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(appointment.id)}>
                <Trash2 className="size-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </LiquidGlassCard>
  )
}
