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

## Backups

This is a single-device app. The data lives in one browser's local storage, so the backup has to come off that device.

On an installed iOS app, **Export** opens the native share sheet — send it to Files, iCloud Drive, or mail it to yourself. On desktop it downloads a JSON file. **Copy** is the last-resort fallback: the whole backup on the clipboard, ready to paste into Notes.

A download link alone is not enough here. Installed iOS apps frequently swallow `<a download>` in standalone mode, which is why the share sheet is tried first.

The card starts asking for a backup once there are three days of history and nothing has ever been exported, then every 14 days after an export.

Deleting the app from your home screen, or clearing website data, destroys the history instantly and unrecoverably. Daily use of an installed app protects it from Safari's usual 7-day storage cap, but nothing protects it from those two.

## The Week

| Day | Focus |
| --- | --- |
| Monday | Full recovery — pay off the weekend |
| Tuesday | Lower strength |
| Wednesday | Mobility and reset |
| Thursday | Push, pull, carry |
| Friday | Easy movement — taper into the weekend |
| Saturday | Court day |
| Sunday | Court day two — longer warm-up, mandatory cool-down |

## How the Day Is Chosen

`lib/program.ts` holds the seven day templates. The date maps to a rotation slot, and `lib/resolve-day.ts` may downshift that template based on the morning check-in.

- Readiness of 4 or less forces a full recovery day.
- Readiness of 6 or less downshifts anything demanding to mobility.
- Playing yesterday costs one point of readiness on a demanding day. It is a penalty, not an override, because the weekend is back-to-back on purpose — a hard rule would cancel every Sunday.

The header always shows what was scheduled and why it changed.

Editing the plan means editing `lib/program.ts`. It is data, not components.

## Targets

Baselines for 6'0", 220 lb, 52-year-old male, set in [lib/dashboard-data.ts](lib/dashboard-data.ts):

- **Protein 160g** — about 1.6g per kg. Deliberately at the upper end, because older muscle responds less to the same dose. Three meals plus one shake gets there.
- **Water 12 glasses** (~2.8L), 14 on court days. Creatine raises fluid needs slightly; this covers it.

These are starting points, not prescriptions. Move them once real days say so. Worth a word with your doctor if anything here is new, especially alongside new supplements.

## Documentation

- `docs/vision/AI_GUIDE.md`
- `docs/vision/ROADMAP.md`
- `docs/vision/ARCHITECTURE.md`
- `docs/weeks/002-a-plan-that-changes.md`
- `docs/decisions/`
- `docs/backlog/IDEAS.md`
- `docs/releases/0.2.md`

Future AI sessions should begin with `AGENTS.md`.
