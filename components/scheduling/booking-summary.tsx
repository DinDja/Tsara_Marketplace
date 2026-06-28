import { CalendarDays, Clock, CreditCard, MessageSquare } from "lucide-react"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import type { ConsultationType } from "@/lib/services/consultations"
import type { Coupon } from "@/lib/types"

interface BookingSummaryProps {
  type: ConsultationType | null
  selectedDate?: Date
  selectedTime?: string | null
  price: number
  discount?: number
  finalPrice: number
  coupon?: Coupon | null
  message?: string
}

export function BookingSummary({
  type,
  selectedDate,
  selectedTime,
  price,
  discount = 0,
  finalPrice,
  coupon,
  message,
}: BookingSummaryProps) {
  return (
    <LiquidGlassCard className="p-5 py-5">
      <h2 className="text-base font-semibold text-foreground">Resumo</h2>
      <p className="mt-1 text-xs text-muted-foreground font-sans">
        Revise os detalhes antes de confirmar.
      </p>

      <div className="mt-5 space-y-4 text-sm font-sans">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Consulta</span>
          <p className="mt-1 font-medium text-foreground">{type?.name || "Ainda nao selecionada"}</p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Data
            </span>
            <span className="text-right font-medium text-foreground">
              {selectedDate
                ? selectedDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
                : "Pendente"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Horario
            </span>
            <span className="font-medium text-foreground">{selectedTime || "Pendente"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              Valor
            </span>
            <span className="font-medium text-foreground">R$ {formatPrice(price)}</span>
          </div>
        </div>

        {coupon ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-500">
            Cupom {coupon.code}: -R$ {formatPrice(discount)}
          </div>
        ) : null}

        {message ? (
          <div className="flex gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-muted-foreground">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <ExpandableText text={message} lines={3} threshold={160} className="text-sm leading-relaxed" />
          </div>
        ) : null}

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">R$ {formatPrice(finalPrice)}</span>
        </div>
      </div>
    </LiquidGlassCard>
  )
}
