import { describe, expect, it } from "vitest"

import { baseChecklist } from "@/lib/dashboard-data"
import { courtReadyProgram } from "@/lib/program"
import { readinessScore, resolveDay, scheduledTemplate } from "@/lib/resolve-day"
import type { CheckIn, CheckInScore } from "@/types/dashboard"

function checkIn(
  sleep: CheckInScore,
  soreness: CheckInScore,
  energy: CheckInScore,
  playedYesterday = false
): CheckIn {
  return { sleep, soreness, energy, playedYesterday }
}

const monday = "2026-07-27"
const tuesday = "2026-07-28" // court day
const wednesday = "2026-07-29" // mobility
const sunday = "2026-08-02" // recovery

describe("scheduledTemplate", () => {
  it("covers the whole week without repeating the rotation slot", () => {
    const week = [
      "2026-07-27",
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
    ].map((date) => scheduledTemplate(date).id)

    expect(week).toEqual([
      "strength-lower",
      "court",
      "mobility",
      "strength-upper",
      "easy-move",
      "court",
      "recovery",
    ])
  })

  it("gives the same template on the same weekday a week later", () => {
    expect(scheduledTemplate(monday).id).toBe(scheduledTemplate("2026-08-03").id)
  })

  it("is a pure function of the date, not of when it is called", () => {
    expect(scheduledTemplate(tuesday).id).toBe(scheduledTemplate(tuesday).id)
  })
})

describe("readinessScore", () => {
  it("spans 3 to 9", () => {
    expect(readinessScore(checkIn(1, 1, 1))).toBe(3)
    expect(readinessScore(checkIn(3, 3, 3))).toBe(9)
  })
})

describe("resolveDay without a check-in", () => {
  it("uses the scheduled template and reports no adaptation", () => {
    const day = resolveDay(monday, null)

    expect(day.template.id).toBe("strength-lower")
    expect(day.adapted).toBe(false)
    expect(day.adaptationReason).toBeNull()
    expect(day.readiness).toBeNull()
  })
})

describe("resolveDay adaptation", () => {
  it("forces full recovery when readiness bottoms out", () => {
    const day = resolveDay(monday, checkIn(1, 1, 1))

    expect(day.template.id).toBe("recovery")
    expect(day.adapted).toBe(true)
    expect(day.adaptationReason).toMatch(/recovery/i)
    expect(day.workout.intensity).toBe("Rest")
  })

  it("downshifts a strength day when readiness is middling", () => {
    const day = resolveDay(monday, checkIn(2, 2, 2))

    expect(day.scheduled.id).toBe("strength-lower")
    expect(day.template.id).toBe("mobility")
    expect(day.adapted).toBe(true)
  })

  it("downshifts back-to-back court days", () => {
    const day = resolveDay(tuesday, checkIn(3, 3, 3, true))

    expect(day.scheduled.id).toBe("court")
    expect(day.template.id).toBe("mobility")
    expect(day.adaptationReason).toMatch(/played yesterday/i)
  })

  it("keeps a court day when you are fresh and did not play yesterday", () => {
    const day = resolveDay(tuesday, checkIn(3, 3, 3, false))

    expect(day.template.id).toBe("court")
    expect(day.adapted).toBe(false)
  })

  it("leaves an easy day alone even when readiness is middling", () => {
    // Mobility is already the downshift target; it must not be downshifted.
    const day = resolveDay(wednesday, checkIn(2, 2, 2))

    expect(day.template.id).toBe("mobility")
    expect(day.adapted).toBe(false)
  })

  it("does not upshift a recovery day when you feel great", () => {
    const day = resolveDay(sunday, checkIn(3, 3, 3))

    expect(day.template.id).toBe("recovery")
    expect(day.adapted).toBe(false)
  })

  it("reports readiness whenever a check-in exists", () => {
    expect(resolveDay(monday, checkIn(3, 2, 2)).readiness).toBe(7)
  })
})

describe("resolveDay checklist", () => {
  it("keeps the base anchors and appends the template's extras", () => {
    const day = resolveDay(monday, null)
    const ids = day.checklist.map((item) => item.id)

    for (const anchor of baseChecklist) {
      expect(ids).toContain(anchor.id)
    }

    expect(ids).toContain("strength-post-protein")
  })

  it("ends the day with the evening downshift", () => {
    const day = resolveDay(tuesday, null)

    expect(day.checklist[day.checklist.length - 1].id).toBe("evening-downshift")
  })

  it("never produces duplicate ids", () => {
    for (const template of courtReadyProgram.days) {
      const day = resolveDay(monday, null, {
        ...courtReadyProgram,
        days: [template],
      })
      const ids = day.checklist.map((item) => item.id)

      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe("resolveDay targets", () => {
  it("raises the water target on court days only", () => {
    expect(resolveDay(tuesday, null).waterTarget).toBe(10)
    expect(resolveDay(monday, null).waterTarget).toBe(8)
  })

  it("uses the downshifted template's target after adaptation", () => {
    const day = resolveDay(tuesday, checkIn(3, 3, 3, true))

    expect(day.template.id).toBe("mobility")
    expect(day.waterTarget).toBe(8)
  })
})
