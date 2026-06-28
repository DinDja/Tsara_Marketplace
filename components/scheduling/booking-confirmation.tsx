import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { formatPrice } from "@/lib/utils"
import type { ConsultationType } from "@/lib/services/consultations"

interface BookingConfirmationProps {
  type: ConsultationType | null
  selectedDate?: Date
  selectedTime?: string | null
  email: string
  finalPrice: number
}

export function BookingConfirmation({
  type,
  selectedDate,
  selectedTime,
  email,
  finalPrice,
}: BookingConfirmationProps) {
  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">Agendamento solicitado</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-sans">
        Recebemos sua solicitacao. Voce recebera a confirmacao e os detalhes de atendimento em {email}.
      </p>

      <LiquidGlassCard className="mt-8 p-5 py-5 text-left font-sans">
        <h2 className="font-semibold text-foreground">{type?.name}</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Data
            </span>
            <span className="font-medium text-foreground">
              {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Horario
            </span>
            <span className="font-medium text-foreground">{selectedTime}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </span>
            <span className="max-w-48 truncate font-medium text-foreground">{email}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">Valor</span>
            <span className="text-lg font-bold text-primary">R$ {formatPrice(finalPrice)}</span>
          </div>
        </div>
      </LiquidGlassCard>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="font-sans">
          <Link href="/minhas-consultas">Ver minhas consultas</Link>
        </Button>
        <Button asChild variant="outline" className="font-sans">
          <Link href="/">Voltar ao inicio</Link>
        </Button>
      </div>
    </div>
  )
}
