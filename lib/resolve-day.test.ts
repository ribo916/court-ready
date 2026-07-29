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

const monday = "2026-07-27" // recovery
const tuesday = "2026-07-28" // lower strength
const wednesday = "2026-07-29" // mobility
const friday = "2026-07-31" // easy move
const saturday = "2026-08-01" // court
const sunday = "2026-08-02" // court, day two

describe("scheduledTemplate", () => {
  it("plays on the weekend and recovers on Monday", () => {
    const week = [
      monday,
      tuesday,
      wednesday,
      "2026-07-30",
      friday,
      saturday,
      sunday,
    ].map((date) => scheduledTemplate(date).id)

    expect(week).toEqual([
      "recovery",
      "strength-lower",
      "mobility",
      "strength-upper",
      "easy-move",
      "court",
      "court-two",
    ])
  })

  it("schedules play only on Saturday and Sunday", () => {
    const playDays = [
      monday,
      tuesday,
      wednesday,
      "2026-07-30",
      friday,
      saturday,
      sunday,
    ].filter((date) => scheduledTemplate(date).emphasis === "play")

    expect(playDays).toEqual([saturday, sunday])
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
    const day = resolveDay(tuesday, null)

    expect(day.template.id).toBe("strength-lower")
    expect(day.adapted).toBe(false)
    expect(day.adaptationReason).toBeNull()
    expect(day.readiness).toBeNull()
  })
})

describe("resolveDay adaptation", () => {
  it("forces full recovery when readiness bottoms out", () => {
    const day = resolveDay(tuesday, checkIn(1, 1, 1))

    expect(day.template.id).toBe("recovery")
    expect(day.adapted).toBe(true)
    expect(day.adaptationReason).toMatch(/recovery/i)
    expect(day.workout.intensity).toBe("Rest")
  })

  it("downshifts a strength day when readiness is middling", () => {
    const day = resolveDay(tuesday, checkIn(2, 2, 2))

    expect(day.scheduled.id).toBe("strength-lower")
    expect(day.template.id).toBe("mobility")
    expect(day.adapted).toBe(true)
  })

  it("keeps a court day when you are fresh", () => {
    const day = resolveDay(saturday, checkIn(3, 3, 3, false))

    expect(day.template.id).toBe("court")
    expect(day.adapted).toBe(false)
  })

  it("still lets you play Sunday after a good Saturday", () => {
    // The weekend is back-to-back on purpose. A hard rule here would cancel
    // every Sunday, which is the opposite of what the program schedules.
    const day = resolveDay(sunday, checkIn(3, 3, 3, true))

    expect(day.template.id).toBe("court-two")
    expect(day.adapted).toBe(false)
  })

  it("downshifts Sunday when Saturday left you beaten up", () => {
    const day = resolveDay(sunday, checkIn(2, 2, 3, true))

    expect(day.scheduled.id).toBe("court-two")
    expect(day.template.id).toBe("mobility")
    expect(day.adaptationReason).toMatch(/played yesterday/i)
  })

  it("treats playing yesterday as one point of readiness, not an override", () => {
    // Readiness 8 survives the penalty; the same day without it also plays.
    expect(resolveDay(sunday, checkIn(3, 3, 2, true)).template.id).toBe("court-two")
    // Readiness 7 drops to 6 and downshifts.
    expect(resolveDay(sunday, checkIn(3, 2, 2, true)).template.id).toBe("mobility")
    // Without the penalty, readiness 7 is enough to play.
    expect(resolveDay(sunday, checkIn(3, 2, 2, false)).template.id).toBe("court-two")
  })

  it("ignores playing yesterday on a day that asks nothing", () => {
    const day = resolveDay(monday, checkIn(2, 2, 3, true))

    expect(day.template.id).toBe("recovery")
    expect(day.adapted).toBe(false)
  })

  it("leaves an easy day alone even when readiness is middling", () => {
    // Mobility is already the downshift target; it must not be downshifted.
    const day = resolveDay(wednesday, checkIn(2, 2, 2))

    expect(day.template.id).toBe("mobility")
    expect(day.adapted).toBe(false)
  })

  it("does not upshift a recovery day when you feel great", () => {
    const day = resolveDay(monday, checkIn(3, 3, 3))

    expect(day.template.id).toBe("recovery")
    expect(day.adapted).toBe(false)
  })

  it("reports the readiness you actually reported, before any penalty", () => {
    expect(resolveDay(sunday, checkIn(3, 2, 2, true)).readiness).toBe(7)
  })
})

describe("resolveDay checklist", () => {
  it("keeps the base anchors and appends the template's extras", () => {
    const day = resolveDay(tuesday, null)
    const ids = day.checklist.map((item) => item.id)

    for (const anchor of baseChecklist) {
      expect(ids).toContain(anchor.id)
    }

    expect(ids).toContain("strength-post-protein")
  })

  it("adds a cool-down obligation to the second court day only", () => {
    expect(
      resolveDay(sunday, null).checklist.map((item) => item.id)
    ).toContain("court-cooldown")
    expect(
      resolveDay(saturday, null).checklist.map((item) => item.id)
    ).not.toContain("court-cooldown")
  })

  it("ends the day with the evening downshift", () => {
    const day = resolveDay(saturday, null)

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
  it("raises the water target on both court days only", () => {
    expect(resolveDay(saturday, null).waterTarget).toBe(14)
    expect(resolveDay(sunday, null).waterTarget).toBe(14)
    expect(resolveDay(tuesday, null).waterTarget).toBe(12)
  })

  it("uses the downshifted template's target after adaptation", () => {
    const day = resolveDay(sunday, checkIn(2, 2, 3, true))

    expect(day.template.id).toBe("mobility")
    expect(day.waterTarget).toBe(12)
  })
})
