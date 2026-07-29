"use client"

import { useMemo, useSyncExternalStore } from "react"

import {
  greetingForDate,
  msUntilNextDisplayBoundary,
  toDateKey,
  type DateKey,
  type Greeting,
} from "@/lib/date"

export type Today = {
  date: DateKey
  greeting: Greeting
}

/**
 * The clock is an external store: React does not know when midnight passes or
 * when the app returns to the foreground. The snapshot is a primitive string so
 * repeated reads compare equal without caching an object.
 */
function subscribeToClock(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  function schedule() {
    timer = setTimeout(() => {
      onChange()
      schedule()
    }, msUntilNextDisplayBoundary(new Date()))
  }

  function handleForeground() {
    if (document.visibilityState === "visible") {
      onChange()
    }
  }

  schedule()
  document.addEventListener("visibilitychange", handleForeground)
  window.addEventListener("focus", handleForeground)

  return () => {
    if (timer) {
      clearTimeout(timer)
    }

    document.removeEventListener("visibilitychange", handleForeground)
    window.removeEventListener("focus", handleForeground)
  }
}

function getClockSnapshot(): string {
  const now = new Date()

  return `${toDateKey(now)}|${greetingForDate(now)}`
}

/** The page is statically prerendered, so the server has no local day. */
function getServerSnapshot(): string {
  return ""
}

/**
 * The current local day, resolved after hydration.
 *
 * Returning `null` on the server is deliberate. 0.1 called `new Date()` during
 * render of a statically prerendered page, which baked the build date into the
 * HTML and mismatched on hydration. The value also refreshes at noon, 5pm, and
 * midnight, so an installed PWA left open overnight rolls over to the new day.
 */
export function useToday(): Today | null {
  const snapshot = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerSnapshot
  )

  return useMemo(() => {
    if (!snapshot) {
      return null
    }

    const [date, greeting] = snapshot.split("|")

    return { date, greeting: greeting as Greeting }
  }, [snapshot])
}
