import { Clock, Loader2 } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { cn } from "@/lib/utils"
import type { TimeSlot } from "@/lib/types"

interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  selectedTime: string | null
  selectedDate?: Date
  loading?: boolean
  onSelect: (time: string) => void
}

export function TimeSlotSelector({
  slots,
  selectedTime,
  selectedDate,
  loading,
  onSelect,
}: TimeSlotSelectorProps) {
  const available = slots.filter((slot) => slot.available)
  const occupied = slots.length - available.length

  return (
    <LiquidGlassCard className="p-4 py-4 lg:p-6 lg:py-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Escolha o horario</h2>
      </div>

      {!selectedDate ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 px-6 text-center text-sm text-muted-foreground font-sans">
          Selecione uma data para consultar os horarios.
        </div>
      ) : loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground font-sans">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          Carregando disponibilidade...
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground font-sans">
            {available.length} horarios livres{occupied > 0 ? ` - ${occupied} indisponiveis` : ""}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelect(slot.time)}
                className={cn(
                  "min-h-11 rounded-md border border-white/10 px-3 text-sm font-semibold transition-all backdrop-blur-xl font-sans",
                  slot.available
                    ? "cursor-pointer bg-background/35 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:bg-primary/15 hover:text-primary"
                    : "cursor-not-allowed bg-secondary/20 text-muted-foreground/40 line-through",
                  selectedTime === slot.time && "bg-gold text-background shadow-lg shadow-gold/20 hover:bg-gold hover:text-background"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {available.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground font-sans">
              Nao ha horarios livres nesta data. Escolha outro dia para continuar.
            </div>
          ) : null}
        </>
      )}
    </LiquidGlassCard>
  )
}
