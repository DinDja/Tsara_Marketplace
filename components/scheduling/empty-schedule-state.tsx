import Link from "next/link"
import { CalendarX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface EmptyScheduleStateProps {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyScheduleState({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
}: EmptyScheduleStateProps) {
  return (
    <LiquidGlassCard className="border-dashed px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/70">
        <CalendarX className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground font-sans">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6 font-sans">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : onAction && actionLabel ? (
        <Button type="button" onClick={onAction} className="mt-6 font-sans">
          {actionLabel}
        </Button>
      ) : null}
    </LiquidGlassCard>
  )
}
