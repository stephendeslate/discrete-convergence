# Data Model Specification

## Overview

The Event Management platform uses Prisma ORM with PostgreSQL. The data model supports multi-tenant event management with venues, schedules, tickets, and attendees.

See also: [API Endpoints](api-endpoints.md) for how these models are exposed.

## Models

VERIFY: EM-DATA-001
Prisma schema uses PostgreSQL as the data source with the prisma-client-js generator.

VERIFY: EM-DATA-002
UserRole enum with ADMIN, USER, ORGANIZER values. Each value has @map for snake_case, enum has @@map.

VERIFY: EM-DATA-003
EventStatus enum with DRAFT, PUBLISHED, CANCELLED, COMPLETED values. Each value has @map, enum has @@map.

VERIFY: EM-DATA-004
TicketStatus enum with AVAILABLE, SOLD, CANCELLED, REFUNDED values. Each value has @map, enum has @@map.

VERIFY: EM-DATA-005
User model with id, email (unique), passwordHash, name, role, tenantId. Has @@index on tenantId and @@map to users.

VERIFY: EM-DATA-006
Event model with id, title, description, startDate, endDate, status, capacity, tenantId, venueId. Has @@index on tenantId, status, and composite (tenantId, status). @@map to events.

VERIFY: EM-DATA-007
Venue model with id, name, address, city, capacity, tenantId. Has @@index on tenantId and @@map to venues.

VERIFY: EM-DATA-008
Schedule model with id, title, speaker, startTime, endTime, room, eventId, tenantId. Has @@index on tenantId and eventId. @@map to schedules.

VERIFY: EM-DATA-009
Ticket model with price as Decimal @db.Decimal(12, 2), type, status, eventId, tenantId. Has @@index on tenantId, status, composite (tenantId, status), and eventId. @@map to tickets.

VERIFY: EM-DATA-010
Attendee model with userId, eventId, tenantId, unique constraint on (userId, eventId). Has @@index on tenantId and eventId. @@map to attendees.

VERIFY: EM-DATA-011
EventService uses $executeRaw with Prisma.sql for tenant-scoped raw queries (event stats).

## Conventions

- All models use `@@map('snake_case')` for table names
- All column names use `@map('snake_case')` for PostgreSQL conventions
- All enums use `@@map('snake_case')` with `@map('snake_case')` on values
- Money fields use `Decimal @db.Decimal(12, 2)` - never Float
- All models include `createdAt` and `updatedAt` timestamps
- Multi-tenant isolation via `tenantId` on every model
- Indexes on all tenantId foreign keys, status fields, and composite indexes
- IDs use `@id @default(uuid())` for globally unique identifiers

## Row Level Security

RLS policies are defined in the migration SQL:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all 6 tables
- `ALTER TABLE ... FORCE ROW LEVEL SECURITY` to apply even to table owners
- Each table has a `CREATE POLICY` using `tenant_id = current_setting('app.tenant_id')::TEXT`
- No `::uuid` cast in policy expressions — direct TEXT comparison for compatibility
- Policies apply to SELECT, INSERT, UPDATE, DELETE operations

## Relationships

- User -> Event: via tenantId scope (not foreign key)
- Event -> Venue: eventId references venues(id)
- Event -> Schedule: scheduleId references events(id), one-to-many
- Event -> Ticket: ticketId references events(id), one-to-many
- Event -> Attendee: attendeeId references events(id), many-to-many through Attendee
