# Court Ready

Court Ready is a calm, mobile-first personal athlete dashboard for one recreational pickleball player. It is designed to reduce decision fatigue and answer one question each day: "What should I do today?"

Version 0.1 ships a single polished screen: Today's Dashboard.

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

## Getting Started

Install dependencies, then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## Product Scope

Version 0.1 includes:

- Greeting and date
- One obvious next action
- Today's checklist
- Today's workout
- Supplements
- Hydration and protein tracking
- Evening routine
- Daily completion progress
- Daily note

The app persists checklist completion, water, protein, and notes in local storage. No backend, authentication, database, or analytics are included.

## Documentation

- `docs/vision/AI_GUIDE.md`
- `docs/vision/ROADMAP.md`
- `docs/vision/ARCHITECTURE.md`
- `docs/weeks/001-reset.md`
- `docs/decisions/`
- `docs/backlog/IDEAS.md`
- `docs/releases/0.1.md`

Future AI sessions should begin with `AGENTS.md`.
