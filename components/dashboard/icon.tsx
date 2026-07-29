import { createElement } from "react"
import {
  Bed,
  Dumbbell,
  Footprints,
  Moon,
  NotebookText,
  ShowerHead,
  StretchHorizontal,
  Sun,
  Target,
  Waves,
  type LucideIcon,
} from "lucide-react"

import type { IconName } from "@/types/dashboard"

/** Product data references icons by name so it stays serializable. */
const icons: Record<IconName, LucideIcon> = {
  bed: Bed,
  dumbbell: Dumbbell,
  footprints: Footprints,
  moon: Moon,
  "notebook-text": NotebookText,
  "shower-head": ShowerHead,
  "stretch-horizontal": StretchHorizontal,
  sun: Sun,
  target: Target,
  waves: Waves,
}

type DashboardIconProps = {
  name: IconName
  className?: string
}

/**
 * Resolves the icon with `createElement` rather than assigning it to a local
 * component variable, which would remount on every render.
 */
export function DashboardIcon({ name, className }: DashboardIconProps) {
  return createElement(icons[name], { className, "aria-hidden": true })
}
