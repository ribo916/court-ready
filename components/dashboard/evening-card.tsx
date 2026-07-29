"use client"

import { BatteryCharging, Check } from "lucide-react"

import { Card, CardHeading } from "@/components/dashboard/card"
import { DashboardIcon } from "@/components/dashboard/icon"
import { eveningRoutine, routineItemId } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import type { DayRecord } from "@/types/dashboard"

type EveningCardProps = {
  record: DayRecord
  onToggle: (id: string) => void
}

export function EveningCard({ record, onToggle }: EveningCardProps) {
  return (
    <Card>
      <CardHeading
        eyebrow="Evening routine"
        title="Downshift gently"
        icon={BatteryCharging}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {eveningRoutine.map((item) => {
          const id = routineItemId(item.id)
          const isComplete = Boolean(record.completedItems[id])

          return (
            <button
              key={id}
              type="button"
              aria-pressed={isComplete}
              onClick={() => onToggle(id)}
              className={cn(
                "min-h-24 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25",
                isComplete
                  ? "border-brand-line bg-brand-soft"
                  : "border-hairline-soft bg-inset hover:border-brand-line"
              )}
            >
              <span className="flex items-center justify-between">
                <DashboardIcon
                  name={item.icon}
                  className={cn(
                    "size-5",
                    isComplete ? "text-brand" : "text-ink-muted"
                  )}
                />
                {isComplete ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "mt-3 block font-medium",
                  isComplete ? "text-ink-muted line-through" : "text-ink"
                )}
              >
                {item.label}
              </span>
              <span className="mt-1 block text-sm leading-5 text-ink-subtle">
                {item.detail}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
