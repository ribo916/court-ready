/**
 * All date handling uses the device's local calendar day.
 *
 * A `DateKey` is a `YYYY-MM-DD` string built from local calendar fields, never
 * from `toISOString()`, so the stored day always matches the day the user sees.
 */

export type DateKey = string

const dayInMs = 86_400_000

/** Anchor for program rotation. 2026-01-05 is a Monday, so index 0 is Monday. */
const rotationEpochUtcMs = Date.UTC(2026, 0, 5)

export function toDateKey(date: Date): DateKey {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split("-").map(Number)

  return new Date(year, month - 1, day)
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/** Calendar-day arithmetic that ignores daylight-saving hour shifts. */
export function shiftDateKey(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + days)

  return toDateKey(date)
}

export function daysBetweenDateKeys(from: DateKey, to: DateKey): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number)
  const [toYear, toMonth, toDay] = to.split("-").map(Number)

  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay)
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay)

  return Math.round((toUtc - fromUtc) / dayInMs)
}

/** Stable rotation slot for a date, independent of when the app was opened. */
export function rotationIndex(key: DateKey, cycleLength: number): number {
  if (cycleLength <= 0) {
    return 0
  }

  const [year, month, day] = key.split("-").map(Number)
  const elapsedDays = Math.round(
    (Date.UTC(year, month - 1, day) - rotationEpochUtcMs) / dayInMs
  )

  return ((elapsedDays % cycleLength) + cycleLength) % cycleLength
}

export function formatDateKey(key: DateKey): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(fromDateKey(key))
}

export function formatShortWeekday(key: DateKey): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(
    fromDateKey(key)
  )
}

export type Greeting = "Good morning" | "Good afternoon" | "Good evening"

export function greetingForDate(date: Date): Greeting {
  const hour = date.getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 17) {
    return "Good afternoon"
  }

  return "Good evening"
}

/**
 * Milliseconds until the next moment the header could change: noon, 5pm, or
 * local midnight. Used to reschedule a single timer instead of polling.
 */
export function msUntilNextDisplayBoundary(date: Date): number {
  const boundaries = [12, 17, 24]
  const hour = date.getHours()
  const nextHour = boundaries.find((boundary) => hour < boundary) ?? 24

  const next = new Date(date)
  next.setHours(nextHour, 0, 0, 0)

  return Math.max(1_000, next.getTime() - date.getTime())
}
