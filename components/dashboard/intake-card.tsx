"use client"

import { Minus, Plus, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tone = "water" | "fuel"

// Static class strings so Tailwind can see them.
const toneStyles: Record<Tone, { icon: string; bar: string }> = {
  water: { icon: "text-water", bar: "bg-water" },
  fuel: { icon: "text-fuel", bar: "bg-fuel" },
}

type IntakeCardProps = {
  label: string
  tone: Tone
  icon: LucideIcon
  value: number
  target: number
  step: number
  /** Rendered as the headline, e.g. "3/8" or "60g". */
  display: string
  /** Announced to assistive tech when the value changes. */
  announcement: string
  helper: string
  decreaseLabel: string
  increaseLabel: string
  onChange: (value: number) => void
}

export function IntakeCard({
  label,
  tone,
  icon: Icon,
  value,
  target,
  step,
  display,
  announcement,
  helper,
  decreaseLabel,
  increaseLabel,
  onChange,
}: IntakeCardProps) {
  const percent = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const styles = toneStyles[tone]

  return (
    <div className="rounded-lg border border-hairline bg-panel p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <h2 className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {display}
          </h2>
        </div>
        <Icon className={cn("size-6", styles.icon)} aria-hidden="true" />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={decreaseLabel}
          disabled={value <= 0}
          onClick={() => onChange(value - step)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <div
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
          className="h-2 overflow-hidden rounded-full bg-track"
        >
          <div
            className={cn("h-full rounded-full transition-all", styles.bar)}
            style={{ width: `${percent}%` }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={increaseLabel}
          onClick={() => onChange(value + step)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      <p className="mt-3 text-sm text-ink-subtle">{helper}</p>
    </div>
  )
}
