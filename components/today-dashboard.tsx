"use client"

import {
  BatteryCharging,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Droplets,
  HeartPulse,
  NotebookPen,
  Pill,
  Salad,
  Sparkles,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  eveningRoutine,
  focusCards,
  proteinTarget,
  supplements,
  todaysChecklist,
  todaysWorkout,
  waterTarget,
} from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { useDailyDashboardStorage } from "@/hooks/use-daily-dashboard-storage"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 17) {
    return "Good afternoon"
  }

  return "Good evening"
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())
}

export function TodayDashboard() {
  const { state, toggleItem, setWater, setProtein, setNotes } =
    useDailyDashboardStorage()

  const completedChecklist = todaysChecklist.filter(
    (item) => state.completedItems[item.id]
  ).length
  const recoveryComplete = state.water >= waterTarget ? 1 : 0
  const proteinComplete = state.protein >= proteinTarget ? 1 : 0
  const totalProgressItems = todaysChecklist.length + 2
  const completedProgressItems =
    completedChecklist + recoveryComplete + proteinComplete
  const progress = Math.round(
    (completedProgressItems / totalProgressItems) * 100
  )
  const nextAction =
    todaysChecklist.find((item) => !state.completedItems[item.id]) ??
    todaysChecklist[todaysChecklist.length - 1]

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-8">
        <section className="flex flex-col gap-5">
          <header className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  {getFormattedDate()}
                </p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#20231f] sm:text-4xl">
                  {getGreeting()}.
                </h1>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#dce9df] text-[#1d5f4a]">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-[#d7e2d9] bg-[#eef6ef] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2f6f56] text-white">
                  <Trophy className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#35705a]">
                    Next action
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {nextAction.label}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#516055]">
                    {nextAction.detail}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  Daily completion
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{progress}%</h2>
              </div>
              <HeartPulse className="size-6 text-[#c8563d]" aria-hidden="true" />
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e7e0d3]">
              <div
                className="h-full rounded-full bg-[#2f6f56] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[#676154]">
              {completedProgressItems} of {totalProgressItems} quiet wins
              handled.
            </p>
          </section>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  Today&apos;s checklist
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Keep the day simple
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {todaysChecklist.map((item) => {
                const isComplete = Boolean(state.completedItems[item.id])

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="grid min-h-20 grid-cols-[auto_1fr] gap-3 rounded-lg border border-[#e2ddd2] bg-white p-3 text-left transition hover:border-[#b9cdbc] hover:bg-[#fbfcf8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2f6f56]/25"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 items-center justify-center rounded-full border",
                        isComplete
                          ? "border-[#2f6f56] bg-[#2f6f56] text-white"
                          : "border-[#cfc7b8] text-[#958b7a]"
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Circle className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span>
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[#242721]">
                          {item.label}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[#8b8375]">
                          {item.time}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[#676154]">
                        {item.detail}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </section>

        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            {focusCards.map((card) => {
              const Icon = card.icon

              return (
                <section
                  key={card.label}
                  className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#767064]">
                      {card.label}
                    </p>
                    <Icon className="size-5 text-[#557f72]" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                  <p className="mt-1 text-sm leading-5 text-[#676154]">
                    {card.detail}
                  </p>
                </section>
              )
            })}
          </div>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  Today&apos;s workout
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {todaysWorkout.title}
                </h2>
              </div>
              <div className="rounded-lg bg-[#e8edf3] px-3 py-2 text-sm font-semibold text-[#315477]">
                {todaysWorkout.duration}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#676154]">
              {todaysWorkout.focus}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f4e8dc] px-3 py-1 text-xs font-semibold text-[#8d4b31]">
                {todaysWorkout.intensity}
              </span>
              <span className="rounded-full bg-[#eaf1ea] px-3 py-1 text-xs font-semibold text-[#2f6f56]">
                Recovery before intensity
              </span>
            </div>
            <ol className="mt-5 space-y-3">
              {todaysWorkout.steps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[2rem_1fr] items-center gap-3 text-sm text-[#4d5149]"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#f1eee7] font-semibold text-[#696255]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#767064]">
                    Hydration
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {state.water}/{waterTarget}
                  </h2>
                </div>
                <Droplets className="size-6 text-[#2f6f96]" aria-hidden="true" />
              </div>
              <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Decrease water"
                  onClick={() => setWater(state.water - 1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <div className="h-2 overflow-hidden rounded-full bg-[#e7e0d3]">
                  <div
                    className="h-full rounded-full bg-[#2f6f96]"
                    style={{
                      width: `${Math.min(
                        100,
                        (state.water / waterTarget) * 100
                      )}%`,
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Increase water"
                  onClick={() => setWater(state.water + 1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-[#676154]">Target: 8 glasses.</p>
            </div>

            <div className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#767064]">
                    Protein
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {state.protein}g
                  </h2>
                </div>
                <Salad className="size-6 text-[#6b7f32]" aria-hidden="true" />
              </div>
              <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Decrease protein"
                  onClick={() => setProtein(state.protein - 10)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <div className="h-2 overflow-hidden rounded-full bg-[#e7e0d3]">
                  <div
                    className="h-full rounded-full bg-[#6b7f32]"
                    style={{
                      width: `${Math.min(
                        100,
                        (state.protein / proteinTarget) * 100
                      )}%`,
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Increase protein"
                  onClick={() => setProtein(state.protein + 10)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-[#676154]">
                Target: {proteinTarget}g.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  Supplements
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Simple stack</h2>
              </div>
              <Pill className="size-6 text-[#8d4b31]" aria-hidden="true" />
            </div>
            <div className="mt-4 divide-y divide-[#ebe5dc]">
              {supplements.map((supplement) => (
                <div
                  key={supplement.id}
                  className="grid grid-cols-[1fr_auto] gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{supplement.name}</p>
                    <p className="mt-1 text-sm text-[#676154]">
                      {supplement.note}
                    </p>
                  </div>
                  <p className="text-right text-sm font-medium text-[#767064]">
                    {supplement.timing}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#767064]">
                  Evening routine
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Downshift gently
                </h2>
              </div>
              <BatteryCharging
                className="size-6 text-[#557f72]"
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {eveningRoutine.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[#e2ddd2] bg-white p-3"
                  >
                    <Icon className="size-5 text-[#557f72]" aria-hidden="true" />
                    <p className="mt-3 font-medium">{item.label}</p>
                    <p className="mt-1 text-sm leading-5 text-[#676154]">
                      {item.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#ddd7ca] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
            <label htmlFor="daily-note" className="flex items-center gap-2">
              <NotebookPen className="size-5 text-[#557f72]" aria-hidden="true" />
              <span className="text-sm font-medium text-[#767064]">
                Daily note
              </span>
            </label>
            <textarea
              id="daily-note"
              value={state.notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="One thing that helped today..."
              className="mt-3 min-h-28 w-full resize-none rounded-lg border border-[#ded7cb] bg-white px-3 py-3 text-sm leading-6 text-[#242721] outline-none transition placeholder:text-[#a49a8a] focus:border-[#2f6f56] focus:ring-3 focus:ring-[#2f6f56]/20"
            />
          </section>
        </section>
      </div>
    </main>
  )
}
