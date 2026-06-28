import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarCheck, Clock, MapPin, Star, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { cn, formatPrice } from "@/lib/utils"
import { getConsultationFallbackImage } from "@/lib/fallback-images"
import { useMemo } from "react"
import type { ConsultationType } from "@/lib/services/consultations"

interface SchedulingTypeCardProps {
  type: ConsultationType
  selected?: boolean
  disabled?: boolean
  nextAvailable?: string
  actionHref?: string
  actionLabel?: string
  onSelect?: () => void
  className?: string
}

export function SchedulingTypeCard({
  type,
  selected,
  disabled,
  nextAvailable,
  actionHref,
  actionLabel = "Agendar",
  onSelect,
  className,
}: SchedulingTypeCardProps) {
  const imageSrc = useMemo(() => type.image || getConsultationFallbackImage(), [type.image])
  const content = (
    <LiquidGlassCard
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(event) => {
        if (!onSelect || disabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "h-full min-h-[558px] py-0",
        onSelect && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected && "border-primary/60 bg-primary/10 ring-2 ring-primary/25",
        disabled && "opacity-60",
        type.popular && "border-gold/50 shadow-lg shadow-gold/10",
        className
      )}
    >
      <div className="relative h-40 overflow-hidden bg-secondary/40">
        <Image src={imageSrc} alt={type.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-2xl backdrop-blur">
          {type.icon}
        </div>
        {type.popular && (
          <div className="absolute right-3 top-3 z-30 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 whitespace-nowrap rounded-full border border-white/25 bg-gold/95 px-3 py-1 text-xs font-medium text-background shadow-lg shadow-black/15 backdrop-blur">
            <Star className="h-3 w-3 fill-current" />
            Destaque
          </div>
        )}
      </div>

      <div className="flex h-[calc(100%-10rem)] flex-col p-5">
        <div className="mb-4">
          <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-foreground">{type.name}</h3>
          <div className="mt-2 min-h-[72px]">
            <ExpandableText
              text={type.description}
              lines={3}
              threshold={150}
              className="text-sm leading-relaxed text-muted-foreground font-sans"
            />
          </div>
        </div>

        <div className="space-y-3 border-y border-border/60 py-4 text-sm font-sans">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Duracao
            </span>
            <span className="font-medium text-foreground">{type.duration}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4 text-primary" />
              Formato
            </span>
            <span className="font-medium text-foreground">Online ou presencial</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Proximo horario
            </span>
            <span className="text-right font-medium text-foreground">{nextAvailable || "Ver agenda"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Atendimento
            </span>
            <span className="font-medium text-foreground">Brasil</span>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gold font-sans">R$ {formatPrice(type.price)}</span>
            {type.originalPrice ? (
              <span className="text-sm text-muted-foreground line-through font-sans">
                R$ {formatPrice(type.originalPrice)}
              </span>
            ) : null}
          </div>
          {actionHref ? (
            <Button asChild disabled={disabled} className="w-full gap-2 font-sans">
              <Link href={actionHref}>
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); onSelect?.() }} className="w-full gap-2 font-sans">
              {selected ? "Selecionado" : actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </LiquidGlassCard>
  )

  return <div className="group h-full">{content}</div>
}
