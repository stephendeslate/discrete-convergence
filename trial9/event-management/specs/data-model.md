# Data Model Specification

## Overview

The Event Management platform uses PostgreSQL with Prisma ORM. All models use
multi-tenant isolation via tenant_id fields with Row Level Security policies.

## Entity Models

### User

VERIFY: EM-DATA-001 — Auth service uses $executeRaw with Prisma.sql for tenant user count query

VERIFY: EM-DATA-002 — PrismaService extends PrismaClient with OnModuleInit and OnModuleDestroy lifecycle hooks

Fields: id (UUID), email (unique), passwordHash, name, role (UserRole enum), tenantId, createdAt, updatedAt
Indexes: tenantId, email
Table mapping: @@map('users')

### Event

Fields: id (UUID), title, description (optional), startDate, endDate, status (EventStatus enum),
tenantId, venueId (FK), createdAt, updatedAt
Indexes: tenantId, status, composite (tenantId, status), venueId
Relations: belongs to Venue, has many Tickets, Schedules, Attendees
Table mapping: @@map('events')

### Venue

Fields: id (UUID), name, address, capacity (Int), tenantId, createdAt, updatedAt
Indexes: tenantId
Relations: has many Events
Table mapping: @@map('venues')

### Ticket

Fields: id (UUID), eventId (FK), type, price (Decimal @db.Decimal(12, 2)),
status (TicketStatus enum), tenantId, createdAt, updatedAt
Indexes: tenantId, status, composite (tenantId, status), eventId
Relations: belongs to Event
Table mapping: @@map('tickets')

### Attendee

Fields: id (UUID), eventId (FK), userId (FK), tenantId, createdAt
Unique constraint: (eventId, userId) — prevents duplicate registration
Indexes: tenantId, eventId
Relations: belongs to Event, belongs to User
Table mapping: @@map('attendees')

### Schedule

Fields: id (UUID), eventId (FK), title, startTime, endTime, location (optional),
tenantId, createdAt, updatedAt
Indexes: tenantId, eventId
Relations: belongs to Event
Table mapping: @@map('schedules')

## Enums

- UserRole: ADMIN, USER, ORGANIZER — @@map('user_role') with @map on values
- EventStatus: DRAFT, PUBLISHED, CANCELLED, COMPLETED — @@map('event_status')
- TicketStatus: AVAILABLE, SOLD, CANCELLED, REFUNDED — @@map('ticket_status')

## Row Level Security

All tables have RLS enabled with tenant isolation policies.
tenant_id is TEXT, so no ::uuid cast is used in policies.

## Cross-References

- See [authentication.md](authentication.md) for User auth details
- See [api-endpoints.md](api-endpoints.md) for CRUD operations on these models
