# Data Model Specification

## Overview

The data model uses Prisma 6 ORM with PostgreSQL. All 14 entities are tenant-scoped
with Row Level Security (RLS) enabled at the database level.

## Entities

### Tenant
Root entity. All other entities reference a tenant via tenantId FK.

### User
Authentication entity with email/password/name/role. Unique constraint on (email, tenantId).

### Event
Core domain entity with title, description, status, dates, capacity, venueId.
Supports DRAFT, PUBLISHED, CANCELLED, COMPLETED statuses.

### Venue
Physical location with name, address, city, capacity.

### TicketType
Template for tickets with name, price (Decimal 12,2), quantity, linked to event.

### Ticket
Individual ticket instance with status, price (Decimal 12,2), linked to event/type/attendee.

### Attendee
Event participant with email, name, phone.

### Registration
Links users/attendees to events with status tracking.

### Speaker
Event speaker with name, bio, email, company.

### Session
Event session with title, times, status, linked to event/speaker.

### Sponsor
Event sponsor with name, tier, amount (Decimal 12,2), contact email.

### Category
Event categorization with name, slug. Unique constraint on (slug, tenantId).

### Notification
System notifications with type (EMAIL/SMS/PUSH), subject, body.

### AuditLog
Immutable audit trail with action, entity, entityId, metadata.

## Data Integrity

VERIFY: EM-DATA-001 — PrismaService connects on module init and disconnects on destroy
VERIFY: EM-DATA-002 — PrismaService extends PrismaClient with lifecycle hooks
VERIFY: EM-DATA-003 — EventService uses clampPagination from shared for safe pagination

## Conventions

- All models use `@@map` for snake_case table names
- All enums use `@@map` with `@map` on each value
- All money fields use `Decimal @db.Decimal(12, 2)`
- All tenant-scoped tables have `@@index([tenantId])`
- Status fields have `@@index([status])` and composite `@@index([tenantId, status])`

## Row Level Security

RLS is enabled with FORCE on all 14 tables. Each table has a CREATE POLICY
that checks `current_setting('app.current_tenant_id')` for tenant isolation.

## Related Specs

See [security.md](security.md) for RLS policy details.
See [infrastructure.md](infrastructure.md) for migration details.

## Seed Data

Seed script creates: default tenant, admin user, regular user, venue,
published event, and cancelled event (error state data for testing).
