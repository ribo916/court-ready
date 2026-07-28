import {
  Bed,
  Dumbbell,
  Moon,
  NotebookText,
  ShowerHead,
  StretchHorizontal,
} from "lucide-react"

import type {
  DashboardItem,
  RoutineItem,
  Supplement,
  WorkoutBlock,
} from "@/types/dashboard"

export const waterTarget = 8
export const proteinTarget = 130

export const todaysChecklist: DashboardItem[] = [
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
    id: "walk-reset",
    label: "Easy walk",
    detail: "Ten quiet minutes, no pace target.",
    time: "Midday",
    category: "move",
  },
  {
    id: "evening-downshift",
    label: "Evening downshift",
    detail: "Screens dim, gentle stretch, plan tomorrow.",
    time: "Evening",
    category: "recover",
  },
]

export const todaysWorkout: WorkoutBlock = {
  title: "Strength Reset",
  duration: "22 min",
  intensity: "Easy",
  focus: "Legs, hips, shoulders, and court-ready balance.",
  steps: [
    "Chair squats, 2 x 8",
    "Incline pushups, 2 x 6",
    "Suitcase carry, 3 x 30 seconds per side",
    "Single-leg balance, 2 x 20 seconds per side",
  ],
}

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
    icon: ShowerHead,
  },
  {
    id: "easy-stretch",
    label: "Easy stretch",
    detail: "Hips, calves, chest. Nothing heroic.",
    icon: StretchHorizontal,
  },
  {
    id: "journal",
    label: "One note",
    detail: "What helped your energy today?",
    icon: NotebookText,
  },
  {
    id: "sleep",
    label: "Sleep window",
    detail: "Protect tomorrow's legs.",
    icon: Moon,
  },
]

export const focusCards = [
  {
    label: "Recovery",
    value: "First",
    detail: "No intensity until the basics are handled.",
    icon: Bed,
  },
  {
    label: "Strength",
    value: "Light",
    detail: "Small deposits, clean form.",
    icon: Dumbbell,
  },
]
