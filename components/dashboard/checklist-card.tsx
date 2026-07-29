"use client"

import { Card, CardHeading } from "@/components/dashboard/card"
import { ToggleRow } from "@/components/dashboard/toggle-row"
import type { DashboardItem, DayRecord } from "@/types/dashboard"

type ChecklistCardProps = {
  items: DashboardItem[]
  record: DayRecord
  onToggle: (id: string) => void
}

export function ChecklistCard({ items, record, onToggle }: ChecklistCardProps) {
  return (
    <Card>
      <CardHeading eyebrow="Today's checklist" title="Keep the day simple" />
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <ToggleRow
            key={item.id}
            label={item.label}
            detail={item.detail}
            meta={item.time}
            isComplete={Boolean(record.completedItems[item.id])}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </Card>
  )
}
