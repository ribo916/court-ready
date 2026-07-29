import { CircleCheckBig, Info, Sparkles, Trophy } from "lucide-react"

import { DashboardIcon } from "@/components/dashboard/icon"
import { formatDateKey, type Greeting } from "@/lib/date"
import type { NextAction } from "@/lib/progress"
import type { ResolvedDay } from "@/types/dashboard"

type DayHeaderProps = {
  greeting: Greeting
  day: ResolvedDay
  nextAction: NextAction | null
}

export function DayHeader({ greeting, day, nextAction }: DayHeaderProps) {
  return (
    <header className="rounded-lg border border-hairline bg-panel p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">
            {formatDateKey(day.date)}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {greeting}.
          </h1>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
          <DashboardIcon name={day.template.icon} className="size-3.5" />
          {day.template.name}
        </span>
        {day.adapted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-recover-soft px-3 py-1 text-xs font-semibold text-recover-ink">
            <Info className="size-3.5" aria-hidden="true" />
            Adjusted for today
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-subtle">
        {day.adaptationReason ?? day.template.intent}
      </p>

      {nextAction ? (
        <div className="mt-5 rounded-lg border border-brand-line bg-brand-soft p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
              <Trophy className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
                Next action
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                {nextAction.label}
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink-subtle">
                {nextAction.detail}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-brand-line bg-brand-soft p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
              <CircleCheckBig className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
                Day complete
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                That&apos;s everything.
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink-subtle">
                Nothing left to chase today. Rest is the last rep.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
