"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const lineClampClass = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const

type ClampLines = keyof typeof lineClampClass

interface ExpandableTextProps {
  text?: string | null
  lines?: ClampLines
  threshold?: number
  className?: string
  buttonClassName?: string
  moreLabel?: string
  lessLabel?: string
  emptyText?: string
}

export function ExpandableText({
  text,
  lines = 2,
  threshold,
  className,
  buttonClassName,
  moreLabel = "Ver mais",
  lessLabel = "Ver menos",
  emptyText,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const value = text?.trim() || emptyText || ""
  if (!value) return null

  const shouldToggle = value.length > (threshold ?? lines * 72)

  return (
    <div>
      <p className={cn(!expanded && lineClampClass[lines], className)}>
        {value}
      </p>
      {shouldToggle ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setExpanded((current) => !current)
          }}
          className={cn("mt-1 h-auto px-0 py-0 text-xs font-sans text-primary", buttonClassName)}
        >
          {expanded ? lessLabel : moreLabel}
        </Button>
      ) : null}
    </div>
  )
}
