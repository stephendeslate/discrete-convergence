# Data Model Specification

> **Project:** Event Management
> **Category:** DATA
> **Related:** See [api-endpoints.md](api-endpoints.md) for CRUD operations on these entities, see [infrastructure.md](infrastructure.md) for migrations and RLS

---

## Overview

The event management data model supports multi-tenant event operations with users, events, venues, tickets, and registrations. All entities are tenant-scoped via `tenantId` foreign key with Row Level Security enforced at the database level. Monetary fields use `Decimal(12,2)` — never Float.

---

## Requirements

### VERIFY:EM-DATA-001 — Prisma schema with @@map on all models

Every Prisma model uses `@@map('snake_case_table_name')` to ensure database table names follow PostgreSQL conventions. All fields use appropriate types: `String` for text, `Int` for counts, `Decimal @db.Decimal(12,2)` for monetary values, `DateTime` for timestamps, and enums for constrained values.

### VERIFY:EM-DATA-002 — Enum mapping with @@map and @map

All Prisma enums use `@@map('snake_case_enum_name')` and each enum value uses `@map('UPPER_SNAKE_VALUE')` to maintain consistent naming between Prisma and PostgreSQL. Enums include `UserRole`, `EventStatus`, `TicketStatus`, and `RegistrationStatus`.

### VERIFY:EM-DATA-003 — Indexes on tenantId, status, and composites

Every model with a `tenantId` field has `@@index([tenantId])`. Models with status fields have `@@index([status])`. Composite indexes `@@index([tenantId, status])` exist on Event, Ticket, and Registration for efficient filtered queries.

### VERIFY:EM-DATA-004 — Decimal for monetary fields

All monetary fields (Ticket price) use `Decimal @db.Decimal(12, 2)`. The Float type is never used for money. Price validation in DTOs uses `@IsNumber()` with appropriate constraints.

### VERIFY:EM-DATA-005 — Row Level Security in migrations

The initial migration includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY` for all tenant-scoped tables. RLS policies enforce that rows are only visible to users with matching `tenantId` set via `SET LOCAL app.current_tenant_id`. No `::uuid` cast is used in RLS policies — TEXT comparison only.

### VERIFY:EM-DATA-006 — executeRaw for RLS with Prisma.sql

At least one service file uses `$executeRaw(Prisma.sql\`...\`)` to set the tenant context before queries. This is the mechanism by which RLS policies are activated at the application level. The `$executeRawUnsafe` method is never used anywhere in the codebase.

### VERIFY:EM-DATA-007 — Multi-tenant entity relationships

User is scoped by tenantId. Events, Venues, Tickets, and Registrations all reference a tenant via `tenantId`. Events belong to a Venue. Tickets belong to an Event. Registrations reference both a User and a Ticket. Cascade deletes are disabled for business data.

---

## Entity Summary

| Entity | Key Fields | Status Enum |
|--------|-----------|-------------|
| User | email, passwordHash, role, tenantId | UserRole: ADMIN, ORGANIZER, ATTENDEE |
| Event | title, description, status, startDate, endDate, venueId, tenantId | EventStatus: DRAFT, PUBLISHED, CANCELLED |
| Venue | name, address, capacity, tenantId | — |
| Ticket | name, price, quantity, quantitySold, status, eventId, tenantId | TicketStatus: AVAILABLE, SOLD_OUT, CANCELLED |
| Registration | userId, ticketId, status, tenantId | RegistrationStatus: CONFIRMED, CANCELLED, WAITLISTED |

---

## Event Status Workflow

```
DRAFT → PUBLISHED → CANCELLED
DRAFT → CANCELLED
```

Only ORGANIZER and ADMIN roles can transition event status. The `VALID_TRANSITIONS` map in EventService enforces allowed state changes.
