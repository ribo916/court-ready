# Court Ready Architecture

## Folder Structure

- `app/`: App Router routes, root layout, global CSS, metadata, and the generated `apple-icon.png`.
- `components/`: Product components used by routes.
- `components/dashboard/`: The dashboard's section components. One card per file.
- `components/ui/`: shadcn/ui primitives.
- `hooks/`: Client hooks for browser state and local behavior.
- `lib/`: Product data, the day-resolution engine, storage, and small utilities. Tests live beside the module they cover.
- `scripts/`: Build-time tooling that is not part of the app bundle.
- `types/`: Shared TypeScript types.
- `public/`: Static PWA assets and the service worker.
- `docs/`: Product, architecture, decisions, weekly plans, backlog, and release notes.

## Component Philosophy

Keep route files thin. `components/today-dashboard.tsx` is a composition root: it resolves the day, computes progress, and hands plain props to section components. Section components own layout and interaction for one card and nothing else.

## The Day Engine

The plan is derived, never hardcoded to a single day.

- `lib/program.ts` holds the seven day templates as data. Slot 0 lands on Monday.
- `lib/date.ts` maps a date to a rotation slot with a fixed anchor, so the same date always resolves to the same template regardless of when the app is opened.
- `lib/resolve-day.ts` combines the scheduled template with the morning check-in and returns a `ResolvedDay`: the checklist, workout, and targets for today.
- Adaptation is ordered and explicit. Low readiness forces a recovery day, back-to-back court days downshift to mobility, and a middling readiness downshifts anything demanding. This is how "recovery before intensity" becomes behavior rather than a slogan.
- `lib/progress.ts` scores the day across every card on screen, with partial credit for hydration and protein, and returns `null` from `findNextAction` when the day is genuinely finished.

These modules are pure and are the parts covered by tests.

## Naming Conventions

- Components use PascalCase.
- Hooks use `useDescriptiveName`.
- Static product data uses clear domain names such as `baseChecklist`.
- Local storage keys are versioned and namespaced.
- Checklist ids for supplements and evening routine items are namespaced through `supplementItemId` and `routineItemId` so they cannot collide with plan items.

## Dates

All dates are the device's local calendar day, represented as a `YYYY-MM-DD` `DateKey` built from local fields. Never derive a key from `toISOString()`: that silently shifts the day for anyone west of UTC. Day arithmetic goes through `shiftDateKey` and `daysBetweenDateKeys`, which are daylight-saving safe.

## State Management

State stays local to client components and hooks. There is no global state library.

Storage is treated as an external store and read through `useSyncExternalStore`, not copied into state by an effect. `useDayRecord` layers a date-stamped draft over the stored record so edits are instant, writes are debounced, and a day rollover cannot leave yesterday's edits on screen. Pending writes are flushed on day change, unmount, `pagehide`, and when the page is hidden.

`useToday` treats the clock as an external store too. It returns `null` during the static prerender, because calling `new Date()` during render of a prerendered page bakes the build date into the HTML. It refreshes at noon, 5pm, and midnight, and whenever the app returns to the foreground.

## Storage Strategy

Day records live under `court-ready:v2:day:<YYYY-MM-DD>` and carry a schema version. Persisted data is checklist completion, water, protein, notes, and the morning check-in.

- Reads are total: corrupt JSON, partial records, and hostile values all resolve to a usable record rather than throwing.
- `migrateLegacyRecords` converts 0.1 records on load and is idempotent.
- `pruneOldRecords` drops empty days after three days and everything past a 400-day retention window.
- Local storage can be evicted by the browser, so export and restore are a product feature, not a developer convenience. See ADR-0002.

## Styling Conventions

Every colour is a semantic token declared once in `app/globals.css` and consumed as a Tailwind utility: `bg-panel`, `text-ink-subtle`, `border-brand-line`. Components must not hardcode hex values. Light and dark values live together in `light-dark()`, so the theme follows the system and can be forced with a `.light` or `.dark` class on the root.

The shadcn primitives are mapped onto the same tokens, so `Button` and hand-built cards cannot drift apart.

Fonts use a system stack so builds do not depend on fetching external font assets. The visual system should feel calm, mobile-first, readable, and restrained. Cards are for discrete content groups only and use modest radius.

## Accessibility

Completable rows are buttons carrying `aria-pressed`. Progress bars use `role="progressbar"` with `aria-valuenow`. The check-in uses a `radiogroup` per scale and a `switch` for the played-yesterday toggle. Intake steppers announce their value through a polite live region.

## PWA Strategy

The service worker is registered only in production. Development unregisters existing Court Ready service workers and deletes Court Ready caches, because stale cached documents fight Next.js HMR and cause reload loops.

In production: navigations are network-first with a cache fallback, `/_next/static/` is cache-first because it is content-hashed and immutable, other same-origin assets are stale-while-revalidate, and no handler is allowed to reject. `CACHE_VERSION` in `public/sw.js` must be bumped on each release or returning users hold stale assets.

Icons are generated from the source mark by `npm run icons`: a full-bleed `app/apple-icon.png` for iOS, which ignores the manifest and will not accept an SVG, plus PNG and maskable variants for Android.

## Testing

`npm test` runs Vitest against `lib/**/*.test.ts` in a Node environment. Storage functions accept an injected `StorageLike`, so storage is tested without a DOM. Test the day engine and the storage layer; do not chase coverage of presentational components.

## Coding Standards

Prefer clarity over cleverness. Keep files small, avoid speculative abstractions, preserve TypeScript strictness, and verify with `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
