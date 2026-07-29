import type { DayTemplate, Program } from "@/types/dashboard"

/**
 * A seven-slot rotation. Slot 0 lands on Monday (see `rotationIndex`).
 *
 * Built around playing on Saturday and Sunday: the week recovers from the
 * weekend, builds midweek, tapers on Friday, then plays back-to-back.
 *
 * Templates are data, not code. Editing this list changes the plan.
 */

export const recoveryDay: DayTemplate = {
  id: "recovery",
  name: "Full Recovery",
  emphasis: "recover",
  intent: "Do less on purpose. This is where the gains land.",
  icon: "bed",
  workout: {
    title: "Recovery Reset",
    duration: "15 min",
    intensity: "Rest",
    focus: "Breathing, gentle range of motion, and blood flow.",
    steps: [
      "Box breathing, 5 rounds",
      "Hip flexor stretch, 60 seconds per side",
      "Calf and ankle circles, 60 seconds per side",
      "Easy stroll, 10 minutes",
    ],
  },
  extraChecklist: [
    {
      id: "recovery-legs-up",
      label: "Legs up the wall",
      detail: "Five quiet minutes. Let the ankles drain.",
      time: "Anytime",
      category: "recover",
    },
  ],
}

const mobilityDay: DayTemplate = {
  id: "mobility",
  name: "Mobility & Reset",
  emphasis: "recover",
  intent: "Open the hips and shoulders so the court days feel easy.",
  icon: "stretch-horizontal",
  workout: {
    title: "Mobility Flow",
    duration: "18 min",
    intensity: "Easy",
    focus: "Hips, thoracic spine, ankles, and shoulder rotation.",
    steps: [
      "90/90 hip switches, 2 x 8 per side",
      "Thoracic openers, 2 x 8 per side",
      "Ankle rocks against a wall, 2 x 10 per side",
      "Band pull-aparts, 2 x 12",
    ],
  },
  extraChecklist: [
    {
      id: "mobility-shoulder-care",
      label: "Shoulder care",
      detail: "Two minutes of band work. Paddle shoulder thanks you.",
      time: "Midday",
      category: "recover",
    },
  ],
}

const lowerStrengthDay: DayTemplate = {
  id: "strength-lower",
  name: "Strength Reset",
  emphasis: "strength",
  intent: "Small deposits, clean form. Legs for the third game.",
  icon: "dumbbell",
  workout: {
    title: "Lower Strength",
    duration: "22 min",
    intensity: "Easy",
    focus: "Legs, hips, and court-ready balance.",
    steps: [
      "Chair squats, 2 x 8",
      "Split squats, 2 x 6 per side",
      "Suitcase carry, 3 x 30 seconds per side",
      "Single-leg balance, 2 x 20 seconds per side",
    ],
  },
  extraChecklist: [
    {
      id: "strength-post-protein",
      label: "Protein after lifting",
      detail: "30g within the hour. Don't overthink the source.",
      time: "Post-workout",
      category: "fuel",
    },
  ],
}

const upperStrengthDay: DayTemplate = {
  id: "strength-upper",
  name: "Push, Pull, Carry",
  emphasis: "strength",
  intent: "Build the frame that keeps your paddle shoulder healthy.",
  icon: "dumbbell",
  workout: {
    title: "Upper Strength",
    duration: "22 min",
    intensity: "Easy",
    focus: "Pushing, pulling, and trunk stability.",
    steps: [
      "Incline pushups, 2 x 8",
      "One-arm row, 3 x 8 per side",
      "Farmer carry, 3 x 40 seconds",
      "Dead bug, 2 x 8 per side",
    ],
  },
  extraChecklist: [
    {
      id: "strength-post-protein",
      label: "Protein after lifting",
      detail: "30g within the hour. Don't overthink the source.",
      time: "Post-workout",
      category: "fuel",
    },
  ],
}

const courtDay: DayTemplate = {
  id: "court",
  name: "Court Day",
  emphasis: "play",
  intent: "Play. Warm up first, hydrate between games, stop while it's fun.",
  icon: "target",
  workout: {
    title: "Play Prep",
    duration: "12 min",
    intensity: "Moderate",
    focus: "Warm up the ankles and shoulders before the first serve.",
    steps: [
      "Easy walk or bike, 4 minutes",
      "Leg swings, 10 per side",
      "Lateral shuffles, 3 x 20 seconds",
      "Shadow dinks and light serves, 3 minutes",
    ],
  },
  extraChecklist: [
    {
      id: "court-warmup",
      label: "Warm up before game one",
      detail: "Ten minutes. The first game is where things tweak.",
      time: "Pre-play",
      category: "move",
    },
    {
      id: "court-hydrate",
      label: "Water between games",
      detail: "A few sips every changeover, not all at the end.",
      time: "During play",
      category: "habit",
    },
  ],
}

/**
 * Day two of a back-to-back weekend. Same game, but the warm-up matters more
 * and the day carries an explicit post-play recovery obligation.
 */
const secondCourtDay: DayTemplate = {
  id: "court-two",
  name: "Court Day Two",
  emphasis: "play",
  intent:
    "Second day on. Warm up longer, and stop one game earlier than you want to.",
  icon: "target",
  workout: {
    title: "Play Prep, Day Two",
    duration: "15 min",
    intensity: "Moderate",
    focus: "Yesterday's legs need more runway before the first serve.",
    steps: [
      "Easy walk or bike, 6 minutes",
      "Leg swings and hip circles, 10 per side",
      "Lateral shuffles, 3 x 20 seconds",
      "Shadow dinks and light serves, 4 minutes",
    ],
  },
  extraChecklist: [
    {
      id: "court-warmup",
      label: "Warm up before game one",
      detail: "Fifteen minutes today. Day two is when things tweak.",
      time: "Pre-play",
      category: "move",
    },
    {
      id: "court-hydrate",
      label: "Water between games",
      detail: "A few sips every changeover, not all at the end.",
      time: "During play",
      category: "habit",
    },
    {
      id: "court-cooldown",
      label: "Cool down after the last game",
      detail: "Five minutes of walking and a calf stretch. This is the week's hinge.",
      time: "Post-play",
      category: "recover",
    },
  ],
}

const easyMoveDay: DayTemplate = {
  id: "easy-move",
  name: "Easy Movement",
  emphasis: "move",
  intent: "Keep the engine warm without spending anything.",
  icon: "footprints",
  workout: {
    title: "Aerobic Base",
    duration: "25 min",
    intensity: "Easy",
    focus: "Conversational pace. Nose breathing if you can.",
    steps: [
      "Walk, bike, or swim, 20 minutes easy",
      "Calf raises, 2 x 15",
      "Hip hinge practice, 2 x 10",
      "Long exhale breathing, 2 minutes",
    ],
  },
  extraChecklist: [
    {
      id: "easy-walk",
      label: "Easy walk",
      detail: "Ten quiet minutes, no pace target.",
      time: "Midday",
      category: "move",
    },
  ],
}

export const courtReadyProgram: Program = {
  id: "court-ready-week-v2",
  name: "Court Ready Week",
  days: [
    recoveryDay, // Monday: pay off the weekend
    lowerStrengthDay, // Tuesday
    mobilityDay, // Wednesday
    upperStrengthDay, // Thursday
    easyMoveDay, // Friday: taper into the weekend
    courtDay, // Saturday
    secondCourtDay, // Sunday
  ],
}
