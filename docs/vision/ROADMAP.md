# Court Ready Roadmap

## Vision

Court Ready helps one recreational pickleball player reduce decision fatigue and make the next healthy action obvious each day.

## Core Values

- Calm, simple, encouraging, and sustainable.
- Recovery before intensity.
- Performance over appearance.
- Five-minute daily interactions.
- Consistency beats perfection.

## Current Sprint

Version 0.2: A plan that changes, and a record that lasts.

Shipped scope:

- Seven-day program rotation. The day's plan is derived from the date, not hardcoded.
- Morning check-in: sleep, body, energy, and whether you played yesterday.
- Adaptive day resolution. Low readiness downshifts the scheduled day automatically.
- Versioned day records with a migration from the 0.1 storage format.
- Seven-day history strip.
- Export and restore for the whole history.
- Honest completion scoring across every card on screen.
- Explicit "day complete" state.
- Semantic design tokens with light and dark themes.
- Unit tests for the date, program, progress, and storage layers.

## Shipped Previously

Version 0.1: Today's Dashboard. Greeting, next action, checklist, workout, supplements, hydration and protein, evening routine, daily note, local storage, and PWA setup.

## Planned Phases

- Version 0.3: Strength and mobility progression driven by history.
- Version 0.4: Recovery signals and a weekly reset ritual.
- Version 0.5: Editable plan templates.

## Long-Term Goals

- Help the user know what to do today without opening a generic tracker.
- Build sustainable habits around energy, strength, mobility, recovery, hydration, and protein.
- Keep the product useful offline and quick to use on a phone.

## Technical Debt

- No component or end-to-end tests are committed. `lib/` is covered; the React layer is verified manually.
- `vitest` is pinned to v3 because v4's rolldown binding requires Node `^20.19` or `>=22.12`. Bump both together.
- The service worker cache name is bumped by hand in `public/sw.js` on each release.
- There is no theme toggle. The theme follows the system setting.

## UX Debt

- The program rotation is fixed in `lib/program.ts`. Editing the plan means editing code.
- Adaptation rules are opinionated and not explained in the UI beyond a single sentence.
- Adaptation thresholds (4 and 6) and the played-yesterday penalty of 1 are untuned guesses. They need two weeks of real check-ins before they mean anything.
- Targets are hardcoded constants. If bodyweight or goals move, so must `lib/dashboard-data.ts`.
- The history strip shows completion only, not load, soreness, or trends worth acting on.
- Protein is tracked in 10g steps with no food detail, by design. Revisit only if it stops being useful.

## Changelog

- 0.1: Established project foundation, documentation, PWA setup, and the first Today's Dashboard.
- 0.1.1: Hardened PWA behavior so service workers do not interfere with Next.js development.
- 0.2: Program rotation, morning check-in, adaptive days, durable versioned storage with export and restore, history strip, design tokens with dark mode, and the first test suite.
- 0.2.1: Personalised the plan to weekend play, raised protein and water targets to the athlete's stats, replaced the supplement stack, and changed the played-yesterday rule from an override to a readiness penalty so it stops cancelling every Sunday.
