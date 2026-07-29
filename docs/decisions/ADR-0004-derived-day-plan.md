# ADR-0004: The Day Plan Is Derived, Not Static

## Status

Accepted

## Context

Version 0.1 shipped a single hardcoded day: `todaysWorkout` was a constant. The app gave identical instructions on every future day, so the product promise ("tell me what to do today") failed on day two. No amount of UI polish could fix it, because it was a data-model problem.

Three capabilities were missing: a plan that spans time, history as something the app can read back, and an input the plan can respond to.

## Decision

Model the plan as a rotation of day templates and resolve today from the date.

- `Program` is an ordered list of `DayTemplate`s. The current program is a seven-slot week anchored so slot 0 is Monday.
- `rotationIndex(date, length)` maps a date to a slot using a fixed epoch, so resolution is a pure function of the date rather than of when the app was opened.
- A three-question morning check-in (sleep, body, energy) plus a played-yesterday flag produces a readiness score of 3 to 9.
- `resolveDay(date, checkIn)` applies ordered adaptation rules: readiness at or below 4 forces a recovery day; playing on consecutive court days downshifts to mobility; readiness at or below 6 downshifts anything demanding.

The app always shows both what was scheduled and what it is actually asking for, with a one-line reason when they differ.

## Consequences

- The plan varies by day without any scheduling UI.
- "Recovery before intensity" becomes a behavior the app enacts rather than a label on a card.
- Changing the plan means editing data in `lib/program.ts`, not writing components.
- The rotation is fixed in code. Editable templates are deferred to a later phase.
- Adaptation rules are opinionated and will need tuning against real use. They are ordered and pure, so they are cheap to change and are covered by tests.
- Resolution is deterministic, so history can be re-scored later without storing the resolved plan.
