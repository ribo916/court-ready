import { Card, CardHeading } from "@/components/dashboard/card"
import { formatDateKey, formatShortWeekday, type DateKey } from "@/lib/date"
import { computeProgress } from "@/lib/progress"
import { resolveDay } from "@/lib/resolve-day"
import { isEmptyRecord } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { DayRecord } from "@/types/dashboard"

type WeekStripProps = {
  history: DayRecord[]
  today: DateKey
}

export function WeekStrip({ history, today }: WeekStripProps) {
  const days = history.map((record) => {
    const day = resolveDay(record.date, record.checkIn)
    const progress = computeProgress(day, record)

    return {
      date: record.date,
      percent: isEmptyRecord(record) ? 0 : progress.percent,
      logged: !isEmptyRecord(record),
      isToday: record.date === today,
    }
  })

  const loggedDays = days.filter((day) => day.logged)
  const average = loggedDays.length
    ? Math.round(
        loggedDays.reduce((sum, day) => sum + day.percent, 0) / loggedDays.length
      )
    : 0

  return (
    <Card>
      <CardHeading eyebrow="Last seven days" title="Consistency" />

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-2">
            <div
              className="flex h-20 w-full items-end overflow-hidden rounded-md bg-track"
              role="img"
              aria-label={`${formatDateKey(day.date)}: ${
                day.logged ? `${day.percent}% complete` : "no entry"
              }`}
            >
              <div
                className={cn(
                  "w-full rounded-md transition-all",
                  day.isToday ? "bg-brand" : "bg-brand/55"
                )}
                style={{ height: `${Math.max(day.percent, 2)}%` }}
              />
            </div>
            <span
              aria-hidden="true"
              className={cn(
                "text-xs font-semibold",
                day.isToday ? "text-brand-ink" : "text-ink-muted"
              )}
            >
              {formatShortWeekday(day.date)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink-subtle">
        {loggedDays.length === 0
          ? "No days logged yet. Today is day one."
          : `${loggedDays.length} of 7 days logged, averaging ${average}%.`}
      </p>
    </Card>
  )
}
