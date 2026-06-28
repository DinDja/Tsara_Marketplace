"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, XCircle, Loader2 } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { EmptyScheduleState, ScheduleStatusBadge } from "@/components/scheduling"
import { useAuth } from "@/lib/contexts/auth-context"
import { getAppointmentsByClient, updateAppointmentStatus } from "@/lib/services"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import type { Appointment } from "@/lib/types"

export default function MinhasConsultas() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return }
    if (user) {
      getAppointmentsByClient(user.id, user.email).then(setAppointments).finally(() => setLoadingData(false))
    }
  }, [user, loading, router])

  const canCancel = (apt: Appointment) =>
    apt.status === "pending" || apt.status === "confirmed"

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const updated = await updateAppointmentStatus(cancelTarget.id, "cancelled", cancelReason.trim() || undefined)
      setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a))
      toast.success("Consulta cancelada")
    } catch (err: any) {
      toast.error(err?.code ? `Erro ao cancelar (${err.code})` : "Erro ao cancelar. Tente novamente.")
    } finally {
      setCancelling(false)
      setCancelTarget(null)
      setCancelReason("")
    }
  }

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
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Minhas Consultas</h1>

          {appointments.length === 0 ? (
            <EmptyScheduleState
              title="Nenhuma consulta agendada"
              description="Agende sua primeira consulta e acompanhe status, data e horario por aqui."
              actionHref="/consultas"
              actionLabel="Agendar consulta"
            />
          ) : (
            <div className="space-y-4">
              {appointments.map((apt, i) => {
                return (
                  <motion.div key={apt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <LiquidGlassCard className="min-h-[166px] py-0">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-foreground">{apt.typeName}</h3>
                              <ScheduleStatusBadge status={apt.status} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm font-sans text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                                {new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                              </span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{apt.time}</span>
                            </div>
                            <p className="text-xs font-sans text-muted-foreground mt-1">Agendado em {apt.createdAt.toLocaleDateString("pt-BR")}</p>
                            {(apt.message || apt.notes) && (
                              <div className="mt-3 rounded-md border border-white/10 bg-secondary/40 px-3 py-2">
                                <ExpandableText
                                  text={apt.notes || apt.message}
                                  lines={2}
                                  threshold={120}
                                  className="text-xs leading-relaxed text-muted-foreground font-sans"
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-2">
                            <p className="text-lg font-bold text-primary">R$ {formatPrice(apt.price)}</p>
                            {canCancel(apt) && (
                              <Button variant="outline" size="sm"
                                className="h-7 text-xs gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10 font-sans"
                                onClick={() => setCancelTarget(apt)}>
                                <XCircle className="w-3 h-3" /> Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </main>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar a consulta de <strong>{cancelTarget?.typeName}</strong> no dia{" "}
              {cancelTarget && new Date(cancelTarget.date + "T12:00:00").toLocaleDateString("pt-BR")} às {cancelTarget?.time}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-sans">Justificativa (opcional)</label>
            <Textarea
              placeholder="Conte-nos o motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelTarget(null); setCancelReason("") }} className="font-sans">
              Manter Agendamento
            </Button>
            <Button onClick={handleCancel} disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-sans">
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
