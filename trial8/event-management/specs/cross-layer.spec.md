# Cross-Layer Spec

## EM-CROSS-001 — Event + Venue Association
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Create venue, then event at venue; detail includes venue
- Tests foreign key relationship and include behavior.

## EM-CROSS-002 — Event + Ticket + Schedule Flow
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Full flow: create event, add ticket, add schedule; detail includes both
- Validates multi-entity creation and eager loading.

## EM-CROSS-003 — Attendee Registration Flow
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Register attendee for event
- Validates user-event association through attendee entity.

## EM-CROSS-004 — Duplicate Attendee Rejection
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Duplicate attendee registration returns 409
- Business logic + unique constraint enforcement.
