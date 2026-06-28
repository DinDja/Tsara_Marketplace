import * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const liquidGlassCardClass = cn(
  "group/card relative isolate overflow-hidden rounded-lg border border-white/15 bg-background/45",
  "shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/35",
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_26px_90px_rgba(0,0,0,0.22)]",
  "before:pointer-events-none before:absolute before:inset-px before:z-0 before:rounded-[7px] before:border before:border-white/10",
  "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.1))] before:content-['']",
  "after:pointer-events-none after:absolute after:-inset-20 after:z-0 after:opacity-80 after:content-['']",
  "after:bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(212,175,55,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.08),transparent_34%)]",
  "[&>*]:relative [&>*]:z-10",
)

export function LiquidGlassCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(liquidGlassCardClass, className)} {...props} />
}
