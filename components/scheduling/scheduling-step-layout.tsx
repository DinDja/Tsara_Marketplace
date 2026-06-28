import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SchedulingStep {
  id: number
  label: string
}

interface SchedulingStepLayoutProps {
  steps: SchedulingStep[]
  currentStep: number
  title?: string
  description?: string
  children: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}

export function SchedulingStepLayout({
  steps,
  currentStep,
  title,
  description,
  children,
  aside,
  footer,
}: SchedulingStepLayoutProps) {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-center">
          {steps.map((step, index) => {
            const complete = currentStep > step.id
            const active = currentStep === step.id
            return (
              <div key={step.id} className="contents sm:flex sm:items-center">
                <div className="flex min-w-0 flex-col items-center gap-2 sm:w-24">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                      complete || active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    {complete ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                  </div>
                  <span className={cn("text-center text-[11px] font-sans", active ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 hidden h-px w-10 rounded-full sm:block lg:w-16",
                      complete ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center">
          {title ? <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{title}</h1> : null}
          {description ? (
            <p className={cn("mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground font-sans", title && "mt-3")}>
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("grid gap-6", aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "")}>
        <div>{children}</div>
        {aside ? <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
      </div>

      {footer ? <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">{footer}</div> : null}
    </div>
  )
}
