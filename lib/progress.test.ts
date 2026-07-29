import { describe, expect, it } from "vitest"

import {
  eveningRoutine,
  routineItemId,
  supplementItemId,
  supplements,
} from "@/lib/dashboard-data"
import { computeProgress, findNextAction } from "@/lib/progress"
import { resolveDay } from "@/lib/resolve-day"
import { createEmptyRecord } from "@/lib/storage"
import type { CheckIn, DayRecord, ResolvedDay } from "@/types/dashboard"

const monday = "2026-07-27"
const freshCheckIn: CheckIn = {
  sleep: 3,
  soreness: 3,
  energy: 3,
  playedYesterday: false,
}

function emptyRecord(): DayRecord {
  return createEmptyRecord(monday)
}

function completeEverything(day: ResolvedDay): DayRecord {
  const completedItems: Record<string, boolean> = {}

  for (const item of day.checklist) {
    completedItems[item.id] = true
  }

  for (const supplement of supplements) {
    completedItems[supplementItemId(supplement.id)] = true
  }

  for (const item of eveningRoutine) {
    completedItems[routineItemId(item.id)] = true
  }

  return {
    ...emptyRecord(),
    checkIn: freshCheckIn,
    completedItems,
    water: day.waterTarget,
    protein: day.proteinTarget,
  }
}

describe("computeProgress", () => {
  it("reports zero for an untouched day", () => {
    const day = resolveDay(monday, null)
    const progress = computeProgress(day, emptyRecord())

    expect(progress.percent).toBe(0)
    expect(progress.completed).toBe(0)
    expect(progress.isComplete).toBe(false)
  })

  it("reaches exactly 100 percent when everything is done", () => {
    const day = resolveDay(monday, freshCheckIn)
    const progress = computeProgress(day, completeEverything(day))

    expect(progress.percent).toBe(100)
    expect(progress.completed).toBe(progress.total)
    expect(progress.isComplete).toBe(true)
  })

  it("counts every card on screen, not just the checklist", () => {
    const day = resolveDay(monday, null)
    const progress = computeProgress(day, emptyRecord())
    const expected =
      day.checklist.length + supplements.length + eveningRoutine.length + 2

    expect(progress.total).toBe(expected)
  })

  it("gives partial credit for partial hydration", () => {
    const day = resolveDay(monday, null)
    const half = { ...emptyRecord(), water: day.waterTarget / 2 }
    const hydration = computeProgress(day, half).segments.find(
      (segment) => segment.id === "hydration"
    )

    expect(hydration?.ratio).toBeCloseTo(0.5)
  })

  it("does not let overshooting a target exceed 100 percent", () => {
    const day = resolveDay(monday, freshCheckIn)
    const record = {
      ...completeEverything(day),
      water: day.waterTarget + 6,
      protein: day.proteinTarget + 80,
    }

    expect(computeProgress(day, record).percent).toBe(100)
  })

  it("ignores completed ids that are not part of today's plan", () => {
    const day = resolveDay(monday, null)
    const record = {
      ...emptyRecord(),
      completedItems: { "some-old-item-from-last-week": true },
    }

    expect(computeProgress(day, record).percent).toBe(0)
  })
})

describe("findNextAction", () => {
  it("asks for the check-in first", () => {
    const day = resolveDay(monday, null)
    const action = findNextAction(day, emptyRecord())

    expect(action?.target).toBe("check-in")
  })

  it("moves to the first unchecked checklist item after the check-in", () => {
    const day = resolveDay(monday, freshCheckIn)
    const record = { ...emptyRecord(), checkIn: freshCheckIn }
    const action = findNextAction(day, record)

    expect(action?.target).toBe("checklist")
    expect(action?.id).toBe(day.checklist[0].id)
  })

  it("skips completed checklist items", () => {
    const day = resolveDay(monday, freshCheckIn)
    const record = {
      ...emptyRecord(),
      checkIn: freshCheckIn,
      completedItems: { [day.checklist[0].id]: true },
    }

    expect(findNextAction(day, record)?.id).toBe(day.checklist[1].id)
  })

  it("falls through to hydration, protein, supplements, then evening", () => {
    const day = resolveDay(monday, freshCheckIn)
    const complete = completeEverything(day)

    const missingWater = { ...complete, water: 0 }
    expect(findNextAction(day, missingWater)?.target).toBe("hydration")

    const missingProtein = { ...complete, protein: 0 }
    expect(findNextAction(day, missingProtein)?.target).toBe("protein")

    const missingSupplement = {
      ...complete,
      completedItems: { ...complete.completedItems },
    }
    delete missingSupplement.completedItems[supplementItemId(supplements[0].id)]
    expect(findNextAction(day, missingSupplement)?.target).toBe("supplements")

    const missingRoutine = {
      ...complete,
      completedItems: { ...complete.completedItems },
    }
    delete missingRoutine.completedItems[routineItemId(eveningRoutine[0].id)]
    expect(findNextAction(day, missingRoutine)?.target).toBe("evening")
  })

  it("pluralises the remaining hydration correctly", () => {
    const day = resolveDay(monday, freshCheckIn)
    const complete = completeEverything(day)

    expect(
      findNextAction(day, { ...complete, water: day.waterTarget - 1 })?.detail
    ).toBe("1 glass to go.")
    expect(
      findNextAction(day, { ...complete, water: day.waterTarget - 2 })?.detail
    ).toBe("2 glasses to go.")
  })

  it("returns null when the day is genuinely finished", () => {
    const day = resolveDay(monday, freshCheckIn)

    // The 0.1 bug: a finished day kept pointing at the last checklist item.
    expect(findNextAction(day, completeEverything(day))).toBeNull()
  })
})
