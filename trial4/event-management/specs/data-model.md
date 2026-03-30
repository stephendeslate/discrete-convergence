# Data Model Specification

## Overview

The Event Management platform uses Prisma 6 with PostgreSQL 16. All models use
`@@map` for snake_case table names, enums use `@@map` with `@map` on values.
Monetary fields use `Decimal @db.Decimal(12, 2)` — never Float.

See [api-endpoints.md](api-endpoints.md) for how the data model maps to REST endpoints.

## Requirements

### VERIFY:EM-DATA-001 — Prisma Service with $executeRaw for RLS
The PrismaService extends PrismaClient and provides a `setRlsContext` method
that uses `$executeRaw(Prisma.sql\`...\`)` to set the current organization ID
for Row Level Security. Never uses `$executeRawUnsafe`.

## Schema Design

### Organizations
- id (UUID), name, slug (unique), tier, timestamps
- Tenant root entity — all other entities reference organizationId

### Users
- id, email, passwordHash, firstName, lastName, role (UserRole enum)
- Unique constraint on (email, organizationId)
- Indexes: organizationId, role, (organizationId, role)

### Events
- id, title, slug, description, status (EventStatus enum), timezone
- startDate, endDate, organizationId, venueId (optional)
- Unique constraint on (slug, organizationId)
- Indexes: organizationId, status, (organizationId, status)

### TicketType
- name, price (Decimal @db.Decimal(12, 2)), quota, sold count
- Index on eventId

### Registration
- status (RegistrationStatus enum), userId, eventId, ticketTypeId
- Indexes: eventId, userId, status, (eventId, status)

### Other Entities
- EventSession: time slots within events, indexed by eventId
- Venue: locations with capacity, indexed by organizationId
- RegistrationField/RegistrationFieldValue: custom form fields
- CheckIn: unique per registration (idempotent)
- WaitlistEntry: FIFO ordering by position
- Notification/NotificationTemplate: queued messaging
- AuditLog: immutable log indexed by (organizationId, entityType)

## Enum Mappings

All enums use `@@map('snake_case_enum_name')` with `@map('snake_case_value')`
on each value. This ensures PostgreSQL enum names follow conventions:
- UserRole → user_role (admin, organizer, attendee)
- EventStatus → event_status (draft, published, etc.)
- RegistrationStatus → registration_status (pending, confirmed, etc.)
- FieldType → field_type (text, email, phone, select, checkbox)
- NotificationStatus → notification_status (queued, sent, failed, delivered)

## Row Level Security

All tables have `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`
in the migration. The application sets RLS context via Prisma $executeRaw.

## Indexing Strategy

- Every foreign key has an `@@index`
- Status fields have standalone indexes
- High-query composite indexes on (organizationId, status)
- Unique constraints enforce business rules (slug per org, email per org)
