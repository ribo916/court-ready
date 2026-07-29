"use client"

import { Pill } from "lucide-react"

import { Card, CardHeading } from "@/components/dashboard/card"
import { ToggleRow } from "@/components/dashboard/toggle-row"
import { supplementItemId, supplements } from "@/lib/dashboard-data"
import type { DayRecord } from "@/types/dashboard"

type SupplementsCardProps = {
  record: DayRecord
  onToggle: (id: string) => void
}

export function SupplementsCard({ record, onToggle }: SupplementsCardProps) {
  return (
    <Card>
      <CardHeading
        eyebrow="Supplements"
        title="Simple stack"
        icon={Pill}
        iconClassName="text-recover"
      />
      <div className="mt-4 flex flex-col gap-3">
        {supplements.map((supplement) => {
          const id = supplementItemId(supplement.id)

          return (
            <ToggleRow
              key={id}
              label={supplement.name}
              detail={supplement.note}
              meta={supplement.timing}
              isComplete={Boolean(record.completedItems[id])}
              onToggle={() => onToggle(id)}
            />
          )
        })}
      </div>
    </Card>
  )
}
