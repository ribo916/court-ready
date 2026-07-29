import type { DateKey } from "@/lib/date"

/**
 * Icons are referenced by name so product data stays serializable and free of
 * React imports. `components/dashboard/icon.tsx` maps names to Lucide icons.
 */
export type IconName =
  | "bed"
  | "dumbbell"
  | "footprints"
  | "moon"
  | "notebook-text"
  | "shower-head"
  | "stretch-horizontal"
  | "sun"
  | "target"
  | "waves"

export type ItemCategory = "move" | "fuel" | "recover" | "habit"

export type DashboardItem = {
  id: string
  label: string
  detail: string
  time: string
  category: ItemCategory
}

export type WorkoutBlock = {
  title: string
  duration: string
  intensity: "Rest" | "Easy" | "Moderate"
  focus: string
  steps: string[]
}

export type Supplement = {
  id: string
  name: string
  timing: string
  note: string
}

export type RoutineItem = {
  id: string
  label: string
  detail: string
  icon: IconName
}

// --- Program -----------------------------------------------------------------

export type DayEmphasis = "recover" | "strength" | "move" | "play"

export type DayTemplate = {
  id: string
  name: string
  emphasis: DayEmphasis
  intent: string
  icon: IconName
  workout: WorkoutBlock
  /** Appended to the daily base checklist for this template. */
  extraChecklist: DashboardItem[]
}

export type Program = {
  id: string
  name: string
  /** Rotation slots. Slot 0 lands on Monday. */
  days: DayTemplate[]
}

// --- Daily check-in ----------------------------------------------------------

/** 1 is the depleted end of the scale, 3 is the fresh end. */
export type CheckInScore = 1 | 2 | 3

export type CheckIn = {
  sleep: CheckInScore
  soreness: CheckInScore
  energy: CheckInScore
  playedYesterday: boolean
}

// --- Stored record -----------------------------------------------------------

export type DayRecord = {
  version: number
  date: DateKey
  completedItems: Record<string, boolean>
  water: number
  protein: number
  notes: string
  checkIn: CheckIn | null
}

// --- Resolved day ------------------------------------------------------------

export type ResolvedDay = {
  date: DateKey
  /** What the rotation scheduled, before any check-in adaptation. */
  scheduled: DayTemplate
  /** What the app is actually asking for today. */
  template: DayTemplate
  adapted: boolean
  adaptationReason: string | null
  readiness: number | null
  checklist: DashboardItem[]
  workout: WorkoutBlock
  waterTarget: number
  proteinTarget: number
}

// --- Progress ----------------------------------------------------------------

export type ProgressSegment = {
  id: string
  label: string
  /** 0 to 1. Hydration and protein award partial credit. */
  ratio: number
  weight: number
}

export type ProgressSummary = {
  segments: ProgressSegment[]
  completed: number
  total: number
  percent: number
  isComplete: boolean
}
