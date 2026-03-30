# Tickets Domain Specification

## Overview

Tickets represent access passes for events. They have types (GENERAL, VIP, EARLY_BIRD)
and lifecycle states managed through domain actions (cancel, refund).
All ticket operations enforce tenant isolation as described in [security.md](security.md).
Tickets follow the data model defined in [data-model.md](data-model.md).

## Requirements

### EM-TKT-001 — Ticket CRUD
Create, read (single + list) operations for tickets.
All operations scoped to current tenant via RLS and TenantGuard.
List endpoint supports pagination with page/pageSize parameters.
<!-- VERIFY:EM-TKT-001 — Ticket CRUD operations with tenant isolation -->

### EM-TKT-002 — Ticket Status Lifecycle
Tickets follow status transitions: AVAILABLE -> SOLD -> CANCELLED or REFUNDED.
- cancelTicket(): Only AVAILABLE or SOLD tickets can be cancelled
- refundTicket(): Only SOLD tickets can be refunded
<!-- VERIFY:EM-TKT-002 — Ticket status lifecycle transitions enforced -->

### EM-TKT-003 — Cancel Ticket Action
TicketService.cancelTicket() validates ticket is in AVAILABLE or SOLD status.
Returns 400 if ticket is already CANCELLED or REFUNDED.
Contains branching logic: check status -> validate transition -> update to CANCELLED.
<!-- VERIFY:EM-TKT-003 — Cancel ticket validates AVAILABLE or SOLD status -->

### EM-TKT-004 — Refund Ticket Action
TicketService.refundTicket() validates ticket is in SOLD status.
Returns 400 if ticket is not in SOLD status.
Contains branching logic: check status -> update to REFUNDED.
Also validates ticket price is positive (cannot refund free tickets).
<!-- VERIFY:EM-TKT-004 — Refund ticket validates SOLD status and positive price -->

### EM-TKT-005 — Ticket Event Validation
Creating a ticket requires a valid event that is not cancelled.
Event capacity is checked before ticket creation.
Returns 400 if event is at capacity or cancelled.
<!-- VERIFY:EM-TKT-005 — edge case: ticket creation validates event status and capacity -->

### EM-TKT-006 — Ticket Audit Trail
All ticket operations (create, cancel, refund) are logged to the audit trail.
Audit entries include action type and ticket details.
<!-- VERIFY:EM-TKT-006 — Ticket operations logged to audit trail -->

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | Required, RLS filtered |
| eventId | UUID | Required FK to Event |
| attendeeId | UUID | Optional FK to Attendee |
| type | TicketType | Required, default GENERAL |
| status | TicketStatus | Default: AVAILABLE |
| price | Int | Required, positive |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Relationships

- Ticket belongs to Event (required)
- Ticket optionally belongs to Attendee
