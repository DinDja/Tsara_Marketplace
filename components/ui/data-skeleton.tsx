import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/60",
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <Pulse className="aspect-square rounded-none" />
      <div className="p-5 space-y-3">
        <Pulse className="h-4 w-16" />
        <Pulse className="h-5 w-3/4" />
        <Pulse className="h-5 w-1/3" />
      </div>
    </Card>
  )
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <Pulse className="w-12 h-12 rounded-lg" />
            <Pulse className="h-4 w-12" />
          </div>
          <div className="mt-4 space-y-2">
            <Pulse className="h-8 w-1/2" />
            <Pulse className="h-4 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Pulse key={c} className={`h-4 flex-1 ${c === 0 ? "w-1/4" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonClientCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="bg-card border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Pulse className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Pulse className="h-5 w-28" />
                <Pulse className="h-3 w-20" />
              </div>
            </div>
            <Pulse className="w-8 h-8 rounded-md" />
          </div>
          <div className="space-y-2 mb-4">
            <Pulse className="h-4 w-48" />
            <Pulse className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="text-center space-y-1">
                <Pulse className="h-5 w-8 mx-auto" />
                <Pulse className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonAppointmentList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-start gap-4">
            <Pulse className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-5 w-48" />
              <Pulse className="h-4 w-32" />
              <div className="flex gap-4">
                <Pulse className="h-3 w-24" />
                <Pulse className="h-3 w-16" />
                <Pulse className="h-3 w-28" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Pulse className="h-5 w-16" />
              <Pulse className="h-8 w-8 rounded-md ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
