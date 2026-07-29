import { HeartPulse } from "lucide-react"

import { Card } from "@/components/dashboard/card"
import type { ProgressSummary } from "@/types/dashboard"

export function ProgressCard({ progress }: { progress: ProgressSummary }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">Daily completion</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">
            {progress.percent}%
          </h2>
        </div>
        <HeartPulse className="size-6 text-alert" aria-hidden="true" />
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Daily completion"
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-track"
      >
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-ink-subtle">
        {progress.completed} of {progress.total} quiet wins handled.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {progress.segments.map((segment) => (
          <div key={segment.id} className="flex items-baseline justify-between gap-2">
            <dt className="text-xs font-medium text-ink-muted">
              {segment.label}
            </dt>
            <dd className="text-xs font-semibold tabular-nums text-ink-subtle">
              {Math.round(segment.ratio * 100)}%
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
