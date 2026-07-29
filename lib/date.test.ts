import { describe, expect, it } from "vitest"

import {
  daysBetweenDateKeys,
  fromDateKey,
  greetingForDate,
  isDateKey,
  msUntilNextDisplayBoundary,
  rotationIndex,
  shiftDateKey,
  toDateKey,
} from "@/lib/date"

describe("toDateKey", () => {
  it("uses local calendar fields, not UTC", () => {
    // 23:30 local on the 28th is already the 29th in UTC for western zones.
    // The key must still read as the 28th, which is the day the user sees.
    const late = new Date(2026, 6, 28, 23, 30, 0)

    expect(toDateKey(late)).toBe("2026-07-28")
  })

  it("pads single-digit months and days", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("round-trips through fromDateKey", () => {
    expect(toDateKey(fromDateKey("2026-02-28"))).toBe("2026-02-28")
  })
})

describe("isDateKey", () => {
  it("accepts well-formed keys and rejects everything else", () => {
    expect(isDateKey("2026-07-28")).toBe(true)
    expect(isDateKey("2026-7-28")).toBe(false)
    expect(isDateKey("not-a-date")).toBe(false)
    expect(isDateKey(20260728)).toBe(false)
    expect(isDateKey(null)).toBe(false)
  })
})

describe("shiftDateKey", () => {
  it("crosses month and year boundaries", () => {
    expect(shiftDateKey("2026-07-31", 1)).toBe("2026-08-01")
    expect(shiftDateKey("2026-01-01", -1)).toBe("2025-12-31")
  })

  it("handles leap days", () => {
    expect(shiftDateKey("2028-02-28", 1)).toBe("2028-02-29")
    expect(shiftDateKey("2026-02-28", 1)).toBe("2026-03-01")
  })

  it("survives a spring-forward daylight-saving boundary", () => {
    // US DST starts 2026-03-08. Naive +24h arithmetic lands on the wrong day.
    expect(shiftDateKey("2026-03-07", 1)).toBe("2026-03-08")
    expect(shiftDateKey("2026-03-08", 1)).toBe("2026-03-09")
  })
})

describe("daysBetweenDateKeys", () => {
  it("counts calendar days in both directions", () => {
    expect(daysBetweenDateKeys("2026-07-28", "2026-07-28")).toBe(0)
    expect(daysBetweenDateKeys("2026-07-28", "2026-08-04")).toBe(7)
    expect(daysBetweenDateKeys("2026-08-04", "2026-07-28")).toBe(-7)
  })

  it("is unaffected by daylight-saving transitions", () => {
    expect(daysBetweenDateKeys("2026-03-01", "2026-03-31")).toBe(30)
    expect(daysBetweenDateKeys("2026-10-25", "2026-11-25")).toBe(31)
  })
})

describe("rotationIndex", () => {
  it("puts slot 0 on Monday", () => {
    // 2026-07-27 is a Monday.
    expect(rotationIndex("2026-07-27", 7)).toBe(0)
    expect(rotationIndex("2026-07-28", 7)).toBe(1)
    expect(rotationIndex("2026-08-02", 7)).toBe(6)
  })

  it("repeats every cycle length", () => {
    expect(rotationIndex("2026-07-27", 7)).toBe(rotationIndex("2026-08-03", 7))
  })

  it("stays non-negative before the anchor date", () => {
    for (const date of ["2020-01-01", "2025-12-31", "1999-06-15"]) {
      const index = rotationIndex(date, 7)

      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(7)
    }
  })

  it("tolerates a zero cycle length", () => {
    expect(rotationIndex("2026-07-28", 0)).toBe(0)
  })
})

describe("greetingForDate", () => {
  it("switches at noon and 5pm", () => {
    expect(greetingForDate(new Date(2026, 6, 28, 0, 0))).toBe("Good morning")
    expect(greetingForDate(new Date(2026, 6, 28, 11, 59))).toBe("Good morning")
    expect(greetingForDate(new Date(2026, 6, 28, 12, 0))).toBe("Good afternoon")
    expect(greetingForDate(new Date(2026, 6, 28, 16, 59))).toBe("Good afternoon")
    expect(greetingForDate(new Date(2026, 6, 28, 17, 0))).toBe("Good evening")
    expect(greetingForDate(new Date(2026, 6, 28, 23, 59))).toBe("Good evening")
  })
})

describe("msUntilNextDisplayBoundary", () => {
  it("targets the next greeting change", () => {
    const morning = new Date(2026, 6, 28, 9, 0, 0)

    expect(msUntilNextDisplayBoundary(morning)).toBe(3 * 60 * 60 * 1000)
  })

  it("targets midnight in the evening so the day rolls over", () => {
    const evening = new Date(2026, 6, 28, 22, 0, 0)

    expect(msUntilNextDisplayBoundary(evening)).toBe(2 * 60 * 60 * 1000)
  })

  it("never returns a non-positive delay", () => {
    const exactlyNoon = new Date(2026, 6, 28, 12, 0, 0)

    expect(msUntilNextDisplayBoundary(exactlyNoon)).toBeGreaterThan(0)
  })
})
