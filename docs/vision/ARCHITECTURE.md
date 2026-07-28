# Court Ready Architecture

## Folder Structure

- `app/`: App Router routes, root layout, global CSS, and metadata conventions.
- `components/`: Product components used by routes.
- `components/ui/`: shadcn/ui primitives.
- `hooks/`: Client hooks for browser state and local behavior.
- `lib/`: Static product data and small utilities.
- `types/`: Shared TypeScript types.
- `public/`: Static PWA assets and service worker.
- `docs/`: Product, architecture, decisions, weekly plans, backlog, and release notes.

## Component Philosophy

Keep route files thin. Product UI should be composed from focused components and static typed data. Extract components only when reuse or readability justifies it.

## Naming Conventions

- Components use PascalCase.
- Hooks use `useDescriptiveName`.
- Static product data uses clear domain names such as `todaysChecklist`.
- Local storage keys are versioned and namespaced.

## Styling Conventions

Use Tailwind CSS v4 utilities with shadcn/ui primitives where helpful. Fonts use a system stack so local and deployment builds do not depend on fetching external font assets. The visual system should feel calm, mobile-first, readable, and restrained. Cards are for discrete content groups only and use modest radius.

## State Management

State stays local to client components and hooks. There is no global state library.

## Storage Strategy

Daily dashboard state is stored in local storage under a date-specific key. Persisted data is limited to checklist completion, water, protein, and notes.

## Design System

The 0.1 palette uses warm off-white surfaces, grounded green actions, muted blue hydration cues, and restrained amber recovery accents. Lucide icons provide recognizable controls and section anchors.

## Coding Standards

Prefer clarity over cleverness. Keep files small, avoid speculative abstractions, preserve TypeScript strictness, and verify with lint, typecheck, and production build.
