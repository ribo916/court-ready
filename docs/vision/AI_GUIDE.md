# Court Ready AI Guide

Court Ready is a calm, mobile-first personal athlete dashboard for one recreational pickleball player. Every feature should help answer: "What should I do today?"

## Session Workflow

1. Read this file.
2. Read `docs/vision/ROADMAP.md`.
3. Read `docs/vision/ARCHITECTURE.md`.
4. Read the latest active file in `docs/weeks/`.
5. Continue the current sprint only.

Before changing Next.js code, read the relevant local guide in `node_modules/next/dist/docs/`. This project uses Next.js 16, React 19, App Router, Tailwind CSS v4, shadcn/ui, Lucide Icons, local storage, and PWA conventions.

## Product Values

- Calm
- Simple
- Encouraging
- Sustainable
- Mobile-first
- Recovery before intensity
- Performance over appearance
- Five-minute daily interactions
- One obvious next action
- Consistency beats perfection

## Coding Standards

- Prefer descriptive names, small focused files, and direct composition.
- Use TypeScript types at data boundaries and component props.
- Keep state local unless a real shared need appears.
- Persist only checklist completion, water, protein, notes, and the morning check-in.
- Do not introduce a backend, authentication, database, API routes, Redux, Zustand, React Query, analytics, or unnecessary packages.
- Do not build future phases unless they are explicitly promoted into the current sprint.

### Rules earned the hard way

- **Never call `new Date()` during render.** The dashboard is statically prerendered; doing so bakes the build date into the HTML. Go through `useToday`.
- **Never build a date key from `toISOString()`.** Use `toDateKey`, which reads local calendar fields.
- **Never hardcode a colour.** Add a semantic token in `app/globals.css` and use the Tailwind utility. Hardcoded hex values are what broke dark mode in 0.1.
- **Never let the plan be a single hardcoded day.** New plan content is data in `lib/program.ts`.
- **Keep `lib/` pure.** The day engine and storage parsing must stay free of React and browser globals so they remain testable.
- **Treat storage as untrusted.** Every read must survive corrupt or hostile values.
- **Bump `CACHE_VERSION` in `public/sw.js`** whenever shipping a release.

## Documentation Rules

- Update `ROADMAP.md` when committed product scope changes.
- Update `ARCHITECTURE.md` when folder structure, state, storage, styling, or core conventions change.
- Add lightweight ADRs for significant decisions.
- Keep `docs/backlog/IDEAS.md` for uncommitted ideas only.
- Add release notes for each milestone.

## Definition of Done

- The feature is complete as a vertical slice.
- Mobile and desktop layouts are responsive and polished, in both light and dark.
- Local storage behavior is verified when storage is touched, including the migration path.
- New logic in `lib/` has tests.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` all pass.
- Documentation reflects the shipped behavior.
- No accidental future features or broad refactors are included.
