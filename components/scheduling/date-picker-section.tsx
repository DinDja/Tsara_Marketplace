import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface DatePickerSectionProps {
  selectedDate?: Date
  onSelect: (date?: Date) => void
  disabled?: (date: Date) => boolean
}

export function DatePickerSection({ selectedDate, onSelect, disabled }: DatePickerSectionProps) {
  return (
    <LiquidGlassCard className="p-4 py-4 lg:p-6 lg:py-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Escolha a data</h2>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        locale={ptBR}
        disabled={disabled}
        weekStartsOn={1}
        className="mx-auto"
      />
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground font-sans">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Selecionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          Disponivel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          Bloqueada
        </span>
      </div>
    </LiquidGlassCard>
  )
}
