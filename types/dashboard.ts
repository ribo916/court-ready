import type { LucideIcon } from "lucide-react"

export type DashboardItem = {
  id: string
  label: string
  detail: string
  time: string
  category: "move" | "fuel" | "recover" | "habit"
}

export type WorkoutBlock = {
  title: string
  duration: string
  intensity: "Easy" | "Moderate"
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
  icon: LucideIcon
}

export type DashboardState = {
  completedItems: Record<string, boolean>
  water: number
  protein: number
  notes: string
}
