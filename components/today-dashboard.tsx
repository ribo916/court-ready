"use client"

import { useMemo } from "react"
import { Droplets, Salad } from "lucide-react"

import { CheckInCard } from "@/components/dashboard/check-in-card"
import { ChecklistCard } from "@/components/dashboard/checklist-card"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { DataCard } from "@/components/dashboard/data-card"
import { DayHeader } from "@/components/dashboard/day-header"
import { EveningCard } from "@/components/dashboard/evening-card"
import { IntakeCard } from "@/components/dashboard/intake-card"
import { NoteCard } from "@/components/dashboard/note-card"
import { ProgressCard } from "@/components/dashboard/progress-card"
import { SupplementsCard } from "@/components/dashboard/supplements-card"
import { WeekStrip } from "@/components/dashboard/week-strip"
import { WorkoutCard } from "@/components/dashboard/workout-card"
import { useDayRecord } from "@/hooks/use-day-record"
import { useHistory } from "@/hooks/use-history"
import { useToday } from "@/hooks/use-today"
import { computeProgress, findNextAction } from "@/lib/progress"
import { resolveDay } from "@/lib/resolve-day"

const historyDays = 7
const proteinStep = 10

export function TodayDashboard() {
  const today = useToday()
  const { record, toggleItem, setWater, setProtein, setNotes, setCheckIn } =
    useDayRecord(today?.date ?? null)
  const history = useHistory(today?.date ?? null, historyDays)

  const day = useMemo(
    () => (today ? resolveDay(today.date, record?.checkIn ?? null) : null),
    [today, record?.checkIn]
  )

  if (!today || !day || !record) {
    return (
      <main className="min-h-screen bg-surface text-ink">
        <DashboardSkeleton />
      </main>
    )
  }

  const progress = computeProgress(day, record)
  const nextAction = findNextAction(day, record)

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-6 lg:py-8">
        <div className="flex flex-col gap-5">
          <DayHeader
            greeting={today.greeting}
            day={day}
            nextAction={nextAction}
          />
          <CheckInCard checkIn={record.checkIn} onSubmit={setCheckIn} />
          <ProgressCard progress={progress} />
          <ChecklistCard
            items={day.checklist}
            record={record}
            onToggle={toggleItem}
          />
          <WeekStrip history={history} today={today.date} />
        </div>

        <div className="flex flex-col gap-5">
          <WorkoutCard
            workout={day.workout}
            focusLine="Recovery before intensity"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <IntakeCard
              label="Hydration"
              tone="water"
              icon={Droplets}
              value={record.water}
              target={day.waterTarget}
              step={1}
              display={`${record.water}/${day.waterTarget}`}
              announcement={`${record.water} of ${day.waterTarget} glasses`}
              helper={`Target: ${day.waterTarget} glasses.`}
              decreaseLabel="Remove a glass of water"
              increaseLabel="Add a glass of water"
              onChange={setWater}
            />
            <IntakeCard
              label="Protein"
              tone="fuel"
              icon={Salad}
              value={record.protein}
              target={day.proteinTarget}
              step={proteinStep}
              display={`${record.protein}g`}
              announcement={`${record.protein} of ${day.proteinTarget} grams of protein`}
              helper={`Target: ${day.proteinTarget}g.`}
              decreaseLabel={`Subtract ${proteinStep} grams of protein`}
              increaseLabel={`Add ${proteinStep} grams of protein`}
              onChange={setProtein}
            />
          </div>

          <SupplementsCard record={record} onToggle={toggleItem} />
          <EveningCard record={record} onToggle={toggleItem} />
          <NoteCard value={record.notes} onChange={setNotes} />
          <DataCard today={today.date} />
        </div>
      </div>
    </main>
  )
}
