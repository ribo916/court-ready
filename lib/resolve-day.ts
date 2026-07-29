import { rotationIndex, type DateKey } from "@/lib/date"
import { baseChecklist, proteinTarget, waterTarget } from "@/lib/dashboard-data"
import { courtReadyProgram, recoveryDay } from "@/lib/program"
import type {
  CheckIn,
  DashboardItem,
  DayTemplate,
  Program,
  ResolvedDay,
} from "@/types/dashboard"

/** 3 (depleted) to 9 (fresh). */
export function readinessScore(checkIn: CheckIn): number {
  return checkIn.sleep + checkIn.soreness + checkIn.energy
}

export function scheduledTemplate(
  date: DateKey,
  program: Program = courtReadyProgram
): DayTemplate {
  return program.days[rotationIndex(date, program.days.length)]
}

/** The template used when readiness says the scheduled day is too much. */
function downshiftTarget(program: Program): DayTemplate {
  return (
    program.days.find((day) => day.id === "mobility") ??
    program.days.find((day) => day.emphasis === "recover") ??
    recoveryDay
  )
}

type Adaptation = {
  template: DayTemplate
  reason: string | null
}

/**
 * Recovery before intensity, expressed as behavior rather than a slogan.
 * Rules are ordered; the first match wins.
 *
 * Playing yesterday costs a point of readiness rather than forcing a downshift.
 * The program schedules back-to-back weekend play on purpose, so a hard rule
 * would cancel every Sunday. A penalty still protects the day when you wake up
 * beaten up, while letting you play when you feel good.
 */
function adapt(
  scheduled: DayTemplate,
  checkIn: CheckIn | null,
  program: Program
): Adaptation {
  if (!checkIn) {
    return { template: scheduled, reason: null }
  }

  const isDemanding =
    scheduled.emphasis === "strength" || scheduled.emphasis === "play"
  const isBackToBack = checkIn.playedYesterday && isDemanding
  const readiness = readinessScore(checkIn) - (isBackToBack ? 1 : 0)

  if (readiness <= 4) {
    return {
      template: recoveryDay,
      reason: "Readiness is low today, so this is a full recovery day.",
    }
  }

  if (readiness <= 6 && isDemanding) {
    return {
      template: downshiftTarget(program),
      reason: isBackToBack
        ? "You played yesterday and you are not fresh, so today opens the hips instead."
        : `${scheduled.name} is scheduled, but today downshifts to mobility.`,
    }
  }

  return { template: scheduled, reason: null }
}

function buildChecklist(template: DayTemplate): DashboardItem[] {
  const anchors = baseChecklist.slice(0, -1)
  const closer = baseChecklist[baseChecklist.length - 1]
  const seen = new Set<string>()

  return [...anchors, ...template.extraChecklist, closer].filter((item) => {
    if (seen.has(item.id)) {
      return false
    }

    seen.add(item.id)
    return true
  })
}

export function resolveDay(
  date: DateKey,
  checkIn: CheckIn | null,
  program: Program = courtReadyProgram
): ResolvedDay {
  const scheduled = scheduledTemplate(date, program)
  const { template, reason } = adapt(scheduled, checkIn, program)

  return {
    date,
    scheduled,
    template,
    adapted: template.id !== scheduled.id,
    adaptationReason: reason,
    readiness: checkIn ? readinessScore(checkIn) : null,
    checklist: buildChecklist(template),
    workout: template.workout,
    // Court days ask for more fluid; everything else keeps the steady target.
    waterTarget: template.emphasis === "play" ? waterTarget + 2 : waterTarget,
    proteinTarget,
  }
}
