# Domain Services Specification

> **Project:** Event Management
> **Category:** DOMAIN (EVENT, VENUE, TICKET, REG)
> **Related:** See [data-model.md](data-model.md) for entity definitions, see [api-endpoints.md](api-endpoints.md) for controller routes, see [authentication.md](authentication.md) for tenant scoping

---

## Overview

The event management platform has four domain services that implement the core business logic for events, venues, tickets, and registrations. Each service follows the multi-tenant pattern with tenant scoping via `tenantId`, uses Prisma for database access, and imports shared utilities for pagination and constants.

---

## Requirements

### VERIFY:EM-EVENT-001 — Event CRUD service with status workflow

The EventService implements full CRUD with multi-tenant scoping. Event status transitions are validated against `VALID_TRANSITIONS`: DRAFT can transition to PUBLISHED or CANCELLED, PUBLISHED can transition to CANCELLED. Invalid transitions throw `BadRequestException`. Only ORGANIZER and ADMIN roles can modify events.

### VERIFY:EM-VENUE-001 — Venue CRUD service with tenant scoping

The VenueService implements full CRUD operations for venues, scoped by `tenantId`. Venue capacity is validated as a positive integer. Venues can be referenced by events via `venueId`. Deletion checks for associated events before removing.

### VERIFY:EM-TICKET-001 — Ticket CRUD service with sold-out and pricing validation

The TicketService implements CRUD with Prisma `Decimal` for price fields. Ticket creation validates that the referenced event exists, is not CANCELLED, and is in PUBLISHED status. Quantity sold tracking prevents overselling. When `quantitySold >= quantity`, the ticket status transitions to SOLD_OUT.

### VERIFY:EM-REG-001 — Registration CRUD service with event validation

The RegistrationService implements CRUD for user registrations. Registration creation validates that the event is PUBLISHED (not DRAFT or CANCELLED) and the ticket is AVAILABLE (not SOLD_OUT). Registration cancellation updates the ticket's `quantitySold` count. All operations are tenant-scoped.

---

## Service Patterns

All domain services follow these common patterns:
- Constructor injection of `PrismaService`
- `findFirst` calls include a justification comment on the preceding line
- Pagination uses `clampPagination` from the shared package
- Tenant scoping via `where: { tenantId }` on all queries
- Business validation throws `BadRequestException` or `NotFoundException`

---

## Event Status Transitions

```
┌───────┐     ┌───────────┐     ┌───────────┐
│ DRAFT │────>│ PUBLISHED │────>│ CANCELLED │
└───────┘     └───────────┘     └───────────┘
    │                                  ▲
    └──────────────────────────────────┘
```

The `VALID_TRANSITIONS` map in EventService:
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CANCELLED'],
  CANCELLED: [],
};
```

---

## Ticket Lifecycle

```
AVAILABLE → SOLD_OUT (when quantitySold >= quantity)
AVAILABLE → CANCELLED (manual cancellation)
```

Price is stored as `Decimal(12,2)` and never uses Float. The DTO validates price with `@IsNumber()`.

---

## Registration Constraints

| Constraint | Validation |
|-----------|------------|
| Event must be PUBLISHED | Checked in create method |
| Ticket must be AVAILABLE | Checked in create method |
| Ticket not oversold | quantitySold < quantity |
| User exists | Foreign key constraint |
| Tenant scope | where clause on tenantId |
