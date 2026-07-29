"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import type { DateKey } from "@/lib/date"
import {
  clampProtein,
  clampWater,
  getDayRecordSnapshot,
  migrateLegacyRecords,
  pruneOldRecords,
  subscribeToStorage,
  writeDayRecord,
} from "@/lib/storage"
import type { CheckIn, DayRecord } from "@/types/dashboard"

/** Keystrokes in the note should not each trigger a synchronous write. */
const writeDelayMs = 400

export type DayRecordApi = {
  record: DayRecord | null
  toggleItem: (id: string) => void
  setWater: (value: number) => void
  setProtein: (value: number) => void
  setNotes: (value: string) => void
  setCheckIn: (checkIn: CheckIn) => void
}

type Draft = {
  date: DateKey
  record: DayRecord
}

/**
 * Today's record, backed by local storage.
 *
 * The stored value is derived from the storage store rather than copied into
 * state by an effect. Edits live in a date-stamped draft that takes precedence
 * while it matches the current day, so a day rollover cannot leave yesterday's
 * edits on screen.
 */
export function useDayRecord(date: DateKey | null): DayRecordApi {
  const stored = useSyncExternalStore(
    subscribeToStorage,
    () => (date ? getDayRecordSnapshot(date) : null),
    () => null
  )

  const [draft, setDraft] = useState<Draft | null>(null)
  const isDirtyRef = useRef(false)
  const draftRef = useRef<Draft | null>(null)

  const record = draft && draft.date === date ? draft.record : stored

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const flush = useCallback(() => {
    if (isDirtyRef.current && draftRef.current) {
      writeDayRecord(draftRef.current.record)
      isDirtyRef.current = false
    }
  }, [])

  // One-time housekeeping. Migration writes, which bumps the revision and
  // re-reads `stored`, so a returning 0.1 user sees their data immediately.
  useEffect(() => {
    if (!date) {
      return
    }

    migrateLegacyRecords()
    pruneOldRecords(date)
  }, [date])

  // Debounced persistence.
  useEffect(() => {
    if (!draft || !isDirtyRef.current) {
      return
    }

    const timer = setTimeout(flush, writeDelayMs)

    return () => clearTimeout(timer)
  }, [draft, flush])

  // Never lose a pending edit when the day rolls over or the hook unmounts.
  useEffect(() => flush, [date, flush])

  // Backgrounding an installed PWA can end the page without an unmount.
  useEffect(() => {
    function flushOnHide() {
      if (document.visibilityState === "hidden") {
        flush()
      }
    }

    document.addEventListener("visibilitychange", flushOnHide)
    window.addEventListener("pagehide", flush)

    return () => {
      document.removeEventListener("visibilitychange", flushOnHide)
      window.removeEventListener("pagehide", flush)
    }
  }, [flush])

  const update = useCallback(
    (updater: (current: DayRecord) => DayRecord) => {
      if (!date || !record) {
        return
      }

      isDirtyRef.current = true

      const next = { date, record: updater(record) }
      draftRef.current = next
      setDraft(next)
    },
    [date, record]
  )

  const toggleItem = useCallback(
    (id: string) => {
      update((current) => {
        const completedItems = { ...current.completedItems }

        if (completedItems[id]) {
          delete completedItems[id]
        } else {
          completedItems[id] = true
        }

        return { ...current, completedItems }
      })
    },
    [update]
  )

  const setWater = useCallback(
    (value: number) => {
      update((current) => ({ ...current, water: clampWater(value) }))
    },
    [update]
  )

  const setProtein = useCallback(
    (value: number) => {
      update((current) => ({ ...current, protein: clampProtein(value) }))
    },
    [update]
  )

  const setNotes = useCallback(
    (value: string) => {
      update((current) => ({ ...current, notes: value }))
    },
    [update]
  )

  const setCheckIn = useCallback(
    (checkIn: CheckIn) => {
      update((current) => ({ ...current, checkIn }))
    },
    [update]
  )

  return { record, toggleItem, setWater, setProtein, setNotes, setCheckIn }
}
