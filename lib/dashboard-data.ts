import type { DashboardItem, RoutineItem, Supplement } from "@/types/dashboard"

/**
 * Baselines for a 6'0", 220 lb, 52-year-old male playing on weekends.
 *
 * Water: 12 x 8oz glasses is about 2.8L, in the usual range for this bodyweight.
 * Court days add two (see `resolveDay`). Creatine raises fluid needs slightly,
 * which this already covers.
 *
 * Protein: 160g is roughly 1.6g per kg of bodyweight. Protein needs rise with
 * age because older muscle responds less to the same dose, so this sits at the
 * upper end deliberately. It is achievable with three meals plus one shake.
 *
 * These are starting points, not prescriptions. Move them once real days say so.
 */
export const waterTarget = 12
export const proteinTarget = 160

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
    id: "multivitamin",
    name: "Multivitamin",
    timing: "With breakfast",
    note: "Take with food so it absorbs and does not turn your stomach.",
  },
  {
    id: "creatine",
    name: "Creatine",
    timing: "Any time",
    note: "5g every day, training or not. Timing does not matter, consistency does.",
  },
  {
    id: "protein-shake",
    name: "Protein shake",
    timing: "Post-workout or gap-filler",
    note: "The simplest 25-30g toward today's target. Log the grams below too.",
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
