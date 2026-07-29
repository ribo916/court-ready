# ADR-0005: Semantic Design Tokens

## Status

Accepted

## Context

Version 0.1 declared the full default shadcn token set plus a `.dark` block in `app/globals.css`, and then ignored all of it: the dashboard hardcoded its colours as hex literals.

Three things followed. Dark mode was defined but broken, because the tokens flipped and the hex values did not. The shadcn primitives rendered in a neutral grey palette that did not match the hand-built green and cream one. And the palette that `ARCHITECTURE.md` described in prose existed nowhere in code.

## Decision

Declare every colour once as a semantic token and consume it as a Tailwind utility.

- Tokens are named for their role: `surface`, `panel`, `inset`, `hairline`, `ink`, `ink-subtle`, `brand`, `water`, `fuel`, `recover`, `alert`.
- Light and dark values live together in `light-dark()`, so the palette is declared once rather than duplicated in a media query and a class.
- `color-scheme: light dark` on the root makes the theme follow the system; `.light` and `.dark` classes force it.
- The shadcn primitives are remapped onto the same tokens.
- Components must not contain hex values.

## Consequences

- Dark mode works, and cannot silently break again, because there is only one place a colour can be defined.
- shadcn components and hand-built cards cannot drift apart.
- Retheming is a single-file change.
- `light-dark()` requires a modern browser. This is acceptable for a personal iPhone-first PWA.
- There is no theme toggle UI. The system setting is the control, which suits an app used in the morning and at night.
