import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/types"

const statusConfig: Record<Appointment["status"], { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/25",
  },
  confirmed: {
    label: "Confirmado",
    className: "bg-green-500/10 text-green-500 border-green-500/25",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-500 border-red-500/25",
  },
  completed: {
    label: "Concluido",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/25",
  },
}

export function ScheduleStatusBadge({
  status,
  className,
}: {
  status: Appointment["status"]
  className?: string
}) {
  const config = statusConfig[status] ?? statusConfig.pending

  return (
    <Badge variant="outline" className={cn("text-xs font-sans", config.className, className)}>
      {config.label}
    </Badge>
  )
}

export { statusConfig }
