# ADR-0002: Local Storage

## Status

Accepted. Amended in 0.2.

## Context

Version 0.1 needs persistence for a single user's daily checklist, hydration, protein, and notes. A backend or database would add complexity before the product needs it.

## Decision

Use browser local storage with a versioned, date-specific key for the dashboard state.

## Consequences

- The app works without authentication or network access after first load.
- Data stays on the user's device.
- Multi-device sync is intentionally deferred.

## Amendment (0.2): durability and history

Two problems surfaced once later phases were planned.

First, 0.1 records were write-only. Nothing read them back, so no trend, progression, or readiness feature was possible without a migration. Version 0.3 progression and 0.4 readiness both need history.

Second, local storage is not durable. It is script-writable storage subject to browser eviction, and one "clear website data" removes everything. With no backend by design, a year of habit data had a single point of failure and no backup.

The resolution is not a backend. It is:

- A versioned record schema (`court-ready:v2:day:<date>`) with a tolerant parser and an idempotent migration from the 0.1 format.
- A history read model, so days can be read back as a window.
- Retention: empty days are dropped after three days, everything else after 400 days.
- Export and restore as a product feature, surfaced in the UI rather than left to devtools.

The no-backend constraint from ADR-0001 stands. The mitigation for its main risk now ships alongside it.
