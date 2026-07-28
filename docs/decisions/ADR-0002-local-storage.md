# ADR-0002: Local Storage

## Status

Accepted

## Context

Version 0.1 needs persistence for a single user's daily checklist, hydration, protein, and notes. A backend or database would add complexity before the product needs it.

## Decision

Use browser local storage with a versioned, date-specific key for the dashboard state.

## Consequences

- The app works without authentication or network access after first load.
- Data stays on the user's device.
- Multi-device sync is intentionally deferred.
