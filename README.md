# Court Ready

Court Ready is a calm, mobile-first personal athlete dashboard for one recreational pickleball player. It is designed to reduce decision fatigue and answer one question each day: "What should I do today?"

Version 0.2 ships a single screen whose plan actually changes: a seven-day rotation that adapts to how you woke up, and a durable record of it.

## Stack

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
- Local Storage
- Progressive Web App
- Vitest

## Getting Started

Install dependencies, then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

```bash
npm run dev        # development server
npm test           # unit tests for lib/
npm run lint
npm run typecheck
npm run build
npm run icons      # regenerate PWA icons from the source mark
```

## Product Scope

Version 0.2 includes:

- Greeting, date, and the day's scheduled focus
- One obvious next action, and an explicit complete state
- Morning check-in: sleep, body, energy, played yesterday
- A workout and checklist that change with the day and adapt to readiness
- Supplements and evening routine, both completable
- Hydration and protein tracking
- Daily completion scoring with partial credit
- Seven-day history strip
- Daily note
- Export and restore

The app persists checklist completion, water, protein, notes, and the morning check-in in local storage. No backend, authentication, database, or analytics are included.

Because local storage can be evicted by the browser, **export a backup now and then**. The button is on the dashboard.

## How the Day Is Chosen

`lib/program.ts` holds seven day templates. The date maps to a rotation slot, and `lib/resolve-day.ts` may downshift that template based on the morning check-in: low readiness forces a recovery day, and playing on consecutive court days switches to mobility. The header always shows what was scheduled and why it changed.

Editing the plan means editing `lib/program.ts`. It is data, not components.

## Documentation

- `docs/vision/AI_GUIDE.md`
- `docs/vision/ROADMAP.md`
- `docs/vision/ARCHITECTURE.md`
- `docs/weeks/002-a-plan-that-changes.md`
- `docs/decisions/`
- `docs/backlog/IDEAS.md`
- `docs/releases/0.2.md`

Future AI sessions should begin with `AGENTS.md`.
