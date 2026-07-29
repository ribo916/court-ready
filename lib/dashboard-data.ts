import type { DashboardItem, RoutineItem, Supplement } from "@/types/dashboard"

export const waterTarget = 8
export const proteinTarget = 130

/** Anchors that repeat every day regardless of which template is scheduled. */
export const baseChecklist: DashboardItem[] = [
  {
    id: "morning-water",
    label: "Start with water",
    detail: "One full glass before coffee.",
    time: "Morning",
    category: "habit",
  },
  {
    id: "mobility-primer",
    label: "Five-minute mobility",
    detail: "Hips, calves, shoulders, then breathe.",
    time: "Morning",
    category: "recover",
  },
  {
    id: "protein-breakfast",
    label: "Protein at breakfast",
    detail: "Aim for 30-40g before the day speeds up.",
    time: "Meal 1",
    category: "fuel",
  },
  {
    id: "evening-downshift",
    label: "Evening downshift",
    detail: "Screens dim, gentle stretch, plan tomorrow.",
    time: "Evening",
    category: "recover",
  },
]

export const supplements: Supplement[] = [
  {
    id: "vitamin-d",
    name: "Vitamin D",
    timing: "With breakfast",
    note: "Take with food.",
  },
  {
    id: "omega-3",
    name: "Omega-3",
    timing: "With lunch",
    note: "Pair with a meal.",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    timing: "Evening",
    note: "Keep it part of the wind-down.",
  },
]

export const eveningRoutine: RoutineItem[] = [
  {
    id: "warm-shower",
    label: "Warm shower",
    detail: "Signal the day is closing.",
    icon: "shower-head",
  },
  {
    id: "easy-stretch",
    label: "Easy stretch",
    detail: "Hips, calves, chest. Nothing heroic.",
    icon: "stretch-horizontal",
  },
  {
    id: "journal",
    label: "One note",
    detail: "What helped your energy today?",
    icon: "notebook-text",
  },
  {
    id: "sleep",
    label: "Sleep window",
    detail: "Protect tomorrow's legs.",
    icon: "moon",
  },
]

/** Checklist ids that the supplement and evening cards own. */
export const supplementItemId = (id: string) => `supplement:${id}`
export const routineItemId = (id: string) => `routine:${id}`
