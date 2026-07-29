import { Card } from "@/components/dashboard/card"
import { cn } from "@/lib/utils"
import type { WorkoutBlock } from "@/types/dashboard"

const intensityStyles: Record<WorkoutBlock["intensity"], string> = {
  Rest: "bg-brand-soft text-brand-ink",
  Easy: "bg-recover-soft text-recover-ink",
  Moderate: "bg-water-soft text-water-ink",
}

type WorkoutCardProps = {
  workout: WorkoutBlock
  focusLine: string
}

export function WorkoutCard({ workout, focusLine }: WorkoutCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">Today&apos;s workout</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">
            {workout.title}
          </h2>
        </div>
        <div className="shrink-0 rounded-lg bg-water-soft px-3 py-2 text-sm font-semibold text-water-ink">
          {workout.duration}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-subtle">{workout.focus}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            intensityStyles[workout.intensity]
          )}
        >
          {workout.intensity}
        </span>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
          {focusLine}
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {workout.steps.map((step, index) => (
          <li
            key={step}
            className="grid grid-cols-[2rem_1fr] items-center gap-3 text-sm text-ink-subtle"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted font-semibold text-ink-muted">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
