# Week 002: A Plan That Changes

## Goal

Make the app worth opening on day two. Replace the single static day with a rotation that adapts, and make the record of it durable enough for later phases to build on.

## Product Scope

- Seven-day program rotation.
- Morning check-in: sleep, body, energy, played yesterday.
- Adaptive day resolution driven by readiness.
- Seven-day history strip.
- Export and restore.
- Honest completion scoring, including a real "day complete" state.

## Data

The plan is derived from the date. `lib/program.ts` holds seven day templates; `lib/resolve-day.ts` picks one and downshifts it when readiness is low. Nothing about today is hardcoded any more.

Day records are versioned under `court-ready:v2:day:<date>` and carry the check-in. Records from 0.1 migrate on first load.

## Recovery Goals

- Low readiness should cost nothing to honour: one tap and the day gets easier.
- Back-to-back court days downshift automatically.
- A finished day should say so and stop asking for more.

## Fixed From 0.1

- The build date was baked into the statically prerendered HTML.
- No midnight rollover: a PWA left open wrote to the previous day's key.
- The storage key used a hardcoded timezone while the display used the device's.
- "Next action" pointed at the last checklist item after everything was done.
- Progress ignored supplements and the evening routine and gave no partial credit.
- Dark mode was declared and broken; colours were hardcoded past the tokens.
- Checklist buttons exposed no state to assistive technology.
- The service worker cache name never changed, and `cacheFirst` could reject.
- No `apple-touch-icon`, so an iPhone install got a generic icon.

## Done

- Dashboard at `/` resolves the day from the date and the check-in.
- 76 unit tests cover the date, program, progress, and storage layers.
- Lint, TypeScript, and production build pass.
- Verified in a real browser: rendering, adaptation, persistence across reload, 0.1 migration, the complete-day state, and both themes.
