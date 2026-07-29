"use client"

import { useSyncExternalStore } from "react"

import type { DateKey } from "@/lib/date"
import { getHistorySnapshot, subscribeToStorage } from "@/lib/storage"
import type { DayRecord } from "@/types/dashboard"

const empty: DayRecord[] = []

/**
 * The last `days` calendar days ending at `date`, oldest first. Missing days
 * come back as empty records so callers can render a fixed-width strip.
 *
 * Re-reads whenever any day record is written.
 */
export function useHistory(date: DateKey | null, days: number): DayRecord[] {
  return useSyncExternalStore(
    subscribeToStorage,
    () => (date ? getHistorySnapshot(date, days) : empty),
    () => empty
  )
}
