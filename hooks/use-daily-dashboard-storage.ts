"use client"

import { useEffect, useMemo, useState } from "react"

import type { DashboardState } from "@/types/dashboard"

const storagePrefix = "court-ready-dashboard-v1"

const defaultState: DashboardState = {
  completedItems: {},
  water: 0,
  protein: 0,
  notes: "",
}

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function parseStoredState(value: string | null): DashboardState {
  if (!value) {
    return defaultState
  }

  try {
    const parsed = JSON.parse(value) as Partial<DashboardState>

    return {
      completedItems:
        parsed.completedItems && typeof parsed.completedItems === "object"
          ? parsed.completedItems
          : {},
      water: typeof parsed.water === "number" ? parsed.water : 0,
      protein: typeof parsed.protein === "number" ? parsed.protein : 0,
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    }
  } catch {
    return defaultState
  }
}

export function useDailyDashboardStorage() {
  const storageKey = useMemo(() => `${storagePrefix}:${getTodayKey()}`, [])
  const [state, setState] = useState<DashboardState>(defaultState)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadStoredState = window.setTimeout(() => {
      setState(parseStoredState(window.localStorage.getItem(storageKey)))
      setIsReady(true)
    }, 0)

    return () => window.clearTimeout(loadStoredState)
  }, [storageKey])

  useEffect(() => {
    if (!isReady) {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [isReady, state, storageKey])

  function toggleItem(id: string) {
    setState((current) => ({
      ...current,
      completedItems: {
        ...current.completedItems,
        [id]: !current.completedItems[id],
      },
    }))
  }

  function setWater(value: number) {
    setState((current) => ({
      ...current,
      water: Math.max(0, Math.min(12, value)),
    }))
  }

  function setProtein(value: number) {
    setState((current) => ({
      ...current,
      protein: Math.max(0, Math.min(220, value)),
    }))
  }

  function setNotes(notes: string) {
    setState((current) => ({
      ...current,
      notes,
    }))
  }

  return {
    state,
    toggleItem,
    setWater,
    setProtein,
    setNotes,
  }
}
