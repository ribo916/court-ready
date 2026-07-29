import {
  eveningRoutine,
  routineItemId,
  supplementItemId,
  supplements,
} from "@/lib/dashboard-data"
import type {
  DayRecord,
  ProgressSegment,
  ProgressSummary,
  ResolvedDay,
} from "@/types/dashboard"

const epsilon = 0.0001

function ratioOf(value: number, target: number): number {
  if (target <= 0) {
    return 1
  }

  return Math.max(0, Math.min(1, value / target))
}

function completedCount(ids: string[], record: DayRecord): number {
  return ids.filter((id) => record.completedItems[id]).length
}

/**
 * Every item shown on the dashboard counts, and hydration and protein award
 * partial credit. The number on screen should describe the actual day.
 */
export function computeProgress(
  day: ResolvedDay,
  record: DayRecord
): ProgressSummary {
  const checklistIds = day.checklist.map((item) => item.id)
  const supplementIds = supplements.map((item) => supplementItemId(item.id))
  const routineIds = eveningRoutine.map((item) => routineItemId(item.id))

  const segments: ProgressSegment[] = [
    {
      id: "checklist",
      label: "Checklist",
      ratio: checklistIds.length
        ? completedCount(checklistIds, record) / checklistIds.length
        : 1,
      weight: checklistIds.length,
    },
    {
      id: "hydration",
      label: "Hydration",
      ratio: ratioOf(record.water, day.waterTarget),
      weight: 1,
    },
    {
      id: "protein",
      label: "Protein",
      ratio: ratioOf(record.protein, day.proteinTarget),
      weight: 1,
    },
    {
      id: "supplements",
      label: "Supplements",
      ratio: supplementIds.length
        ? completedCount(supplementIds, record) / supplementIds.length
        : 1,
      weight: supplementIds.length,
    },
    {
      id: "evening",
      label: "Evening",
      ratio: routineIds.length
        ? completedCount(routineIds, record) / routineIds.length
        : 1,
      weight: routineIds.length,
    },
  ]

  const total = segments.reduce((sum, segment) => sum + segment.weight, 0)
  const earned = segments.reduce(
    (sum, segment) => sum + segment.ratio * segment.weight,
    0
  )

  return {
    segments,
    completed: Math.round(earned),
    total,
    percent: total > 0 ? Math.round((earned / total) * 100) : 0,
    isComplete: earned >= total - epsilon,
  }
}

export type NextAction = {
  id: string
  label: string
  detail: string
  /** Which card the action lives on, so the hero card can point at it. */
  target: "check-in" | "checklist" | "hydration" | "protein" | "supplements" | "evening"
}

/**
 * The single next thing to do, or `null` when the day is genuinely finished.
 * A finished day must never be shown as an outstanding action.
 */
export function findNextAction(
  day: ResolvedDay,
  record: DayRecord
): NextAction | null {
  if (!record.checkIn) {
    return {
      id: "check-in",
      label: "Take the morning check-in",
      detail: "Three taps. It decides how hard today should be.",
      target: "check-in",
    }
  }

  const nextChecklistItem = day.checklist.find(
    (item) => !record.completedItems[item.id]
  )

  if (nextChecklistItem) {
    return {
      id: nextChecklistItem.id,
      label: nextChecklistItem.label,
      detail: nextChecklistItem.detail,
      target: "checklist",
    }
  }

  if (record.water < day.waterTarget) {
    const remaining = day.waterTarget - record.water

    return {
      id: "hydration",
      label: "Finish your water",
      detail: `${remaining} ${remaining === 1 ? "glass" : "glasses"} to go.`,
      target: "hydration",
    }
  }

  if (record.protein < day.proteinTarget) {
    const remaining = day.proteinTarget - record.protein

    return {
      id: "protein",
      label: "Top up your protein",
      detail: `About ${remaining}g left today.`,
      target: "protein",
    }
  }

  const nextSupplement = supplements.find(
    (item) => !record.completedItems[supplementItemId(item.id)]
  )

  if (nextSupplement) {
    return {
      id: supplementItemId(nextSupplement.id),
      label: nextSupplement.name,
      detail: `${nextSupplement.timing}. ${nextSupplement.note}`,
      target: "supplements",
    }
  }

  const nextRoutine = eveningRoutine.find(
    (item) => !record.completedItems[routineItemId(item.id)]
  )

  if (nextRoutine) {
    return {
      id: routineItemId(nextRoutine.id),
      label: nextRoutine.label,
      detail: nextRoutine.detail,
      target: "evening",
    }
  }

  return null
}
