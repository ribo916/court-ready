"use client"

import { useState } from "react"
import { HeartPulse, Pencil } from "lucide-react"

import { Card, CardHeading } from "@/components/dashboard/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CheckIn, CheckInScore } from "@/types/dashboard"

type Scale = {
  key: "sleep" | "soreness" | "energy"
  label: string
  options: [string, string, string]
}

const scales: Scale[] = [
  { key: "sleep", label: "Sleep", options: ["Rough", "OK", "Solid"] },
  { key: "soreness", label: "Body", options: ["Sore", "Normal", "Fresh"] },
  { key: "energy", label: "Energy", options: ["Low", "Steady", "High"] },
]

type Draft = Partial<Pick<CheckIn, "sleep" | "soreness" | "energy">> & {
  playedYesterday: boolean
}

type CheckInCardProps = {
  checkIn: CheckIn | null
  onSubmit: (checkIn: CheckIn) => void
}

function summarize(checkIn: CheckIn) {
  return scales
    .map((scale) => `${scale.label}: ${scale.options[checkIn[scale.key] - 1]}`)
    .join(" · ")
}

export function CheckInCard({ checkIn, onSubmit }: CheckInCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => ({
    sleep: checkIn?.sleep,
    soreness: checkIn?.soreness,
    energy: checkIn?.energy,
    playedYesterday: checkIn?.playedYesterday ?? false,
  }))

  const isOpen = !checkIn || isEditing

  function commitIfComplete(next: Draft) {
    if (next.sleep && next.soreness && next.energy) {
      onSubmit({
        sleep: next.sleep,
        soreness: next.soreness,
        energy: next.energy,
        playedYesterday: next.playedYesterday,
      })
      setIsEditing(false)
    }
  }

  function choose(key: Scale["key"], value: CheckInScore) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    commitIfComplete(next)
  }

  function togglePlayed() {
    const next = { ...draft, playedYesterday: !draft.playedYesterday }
    setDraft(next)
    commitIfComplete(next)
  }

  if (!isOpen && checkIn) {
    return (
      <Card>
        <CardHeading
          eyebrow="Morning check-in"
          title="Logged"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          }
        />
        <p className="mt-3 text-sm leading-6 text-ink-subtle">
          {summarize(checkIn)}
          {checkIn.playedYesterday ? " · Played yesterday" : ""}
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeading
        eyebrow="Morning check-in"
        title="How did you wake up?"
        icon={HeartPulse}
        iconClassName="text-alert"
      />
      <p className="mt-2 text-sm leading-6 text-ink-subtle">
        Three taps. This decides how hard today should be.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {scales.map((scale) => (
          <div key={scale.key}>
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
              id={`check-in-${scale.key}`}
            >
              {scale.label}
            </p>
            <div
              role="radiogroup"
              aria-labelledby={`check-in-${scale.key}`}
              className="mt-2 grid grid-cols-3 gap-2"
            >
              {scale.options.map((option, index) => {
                const value = (index + 1) as CheckInScore
                const isSelected = draft[scale.key] === value

                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => choose(scale.key, value)}
                    className={cn(
                      "min-h-11 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25",
                      isSelected
                        ? "border-brand bg-brand text-white"
                        : "border-hairline-soft bg-inset text-ink-subtle hover:border-brand-line"
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          role="switch"
          aria-checked={draft.playedYesterday}
          onClick={togglePlayed}
          className={cn(
            "flex min-h-11 items-center justify-between rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25",
            draft.playedYesterday
              ? "border-brand bg-brand-soft text-brand-ink"
              : "border-hairline-soft bg-inset text-ink-subtle hover:border-brand-line"
          )}
        >
          <span>Played pickleball yesterday</span>
          <span className="text-xs font-semibold uppercase tracking-[0.12em]">
            {draft.playedYesterday ? "Yes" : "No"}
          </span>
        </button>
      </div>
    </Card>
  )
}
