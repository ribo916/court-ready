"use client"

import { Check, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

type ToggleRowProps = {
  label: string
  detail: string
  meta?: string
  isComplete: boolean
  onToggle: () => void
}

/**
 * A completable row. `aria-pressed` carries the state, which the 0.1 buttons
 * did not expose to assistive technology at all.
 */
export function ToggleRow({
  label,
  detail,
  meta,
  isComplete,
  onToggle,
}: ToggleRowProps) {
  return (
    <button
      type="button"
      aria-pressed={isComplete}
      onClick={onToggle}
      className="grid min-h-20 w-full grid-cols-[auto_1fr] gap-3 rounded-lg border border-hairline-soft bg-inset p-3 text-left transition hover:border-brand-line focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 items-center justify-center rounded-full border transition",
          isComplete
            ? "border-brand bg-brand text-white"
            : "border-hairline text-ink-faint"
        )}
      >
        {isComplete ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Circle className="size-4" aria-hidden="true" />
        )}
      </span>
      <span>
        <span className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "font-medium transition-colors",
              isComplete ? "text-ink-muted line-through" : "text-ink"
            )}
          >
            {label}
          </span>
          {meta ? (
            <span className="shrink-0 text-xs font-medium text-ink-muted">
              {meta}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm leading-6 text-ink-subtle">
          {detail}
        </span>
      </span>
    </button>
  )
}
