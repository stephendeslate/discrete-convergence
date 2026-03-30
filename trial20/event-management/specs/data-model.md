# Data Model Specification

## Overview

The Event Management Platform uses Prisma ORM with PostgreSQL. The schema
defines five core entities with multi-tenant isolation enforced at both the
application and database levels via Row-Level Security (RLS).

## Entities

### User
- id: UUID primary key
- email: unique string
- passwordHash: bcrypt hash
- role: enum (ADMIN, EDITOR, VIEWER)
- tenantId: string for multi-tenant isolation

VERIFY: EM-DATA-001 — PrismaService connects on module init and disconnects on destroy

### Event
- id: UUID primary key
- title: string (required)
- description: optional text
- startDate: DateTime
- endDate: DateTime
- status: enum (DRAFT, PUBLISHED, CANCELLED)
- maxAttendees: integer
- ticketPrice: Decimal(12,2)
- venueId: foreign key to Venue
- tenantId: string

VERIFY: EM-DATA-002 — Event service scopes all queries by tenantId

### Venue
- id: UUID primary key
- name: string
- address: string
- capacity: integer
- tenantId: string

### Attendee
- id: UUID primary key
- firstName: string
- lastName: string
- email: string
- phone: optional string
- tenantId: string

### Registration
- id: UUID primary key
- eventId: foreign key to Event
- attendeeId: foreign key to Attendee
- status: enum (CONFIRMED, WAITLISTED, CANCELLED)
- tenantId: string
- Unique constraint: (eventId, attendeeId) — prevents duplicate registrations

## Indexes

All tables have indexes on:
- tenantId (for tenant-scoped queries)
- status (for filtered listings)
- Composite indexes on frequently queried combinations

See: api-endpoints.md for query patterns
See: performance.md for index strategy

## Row-Level Security

VERIFY: EM-DATA-003 — Event service uses $executeRaw for tenant-scoped operations

Each table has RLS policies:
- ENABLE ROW LEVEL SECURITY on all five tables
- FORCE ROW LEVEL SECURITY (applies even to table owners)
- CREATE POLICY using TEXT comparison (no ::uuid cast)

The RLS policy compares tenant_id = current_setting('app.tenant_id')::TEXT.
This provides defense-in-depth alongside application-layer tenant scoping.

See: security.md for defense-in-depth strategy
See: infrastructure.md for migration management

## Prisma Configuration

The schema uses:
- @@map for table name mapping (snake_case)
- @map on enum values
- @@index for performance-critical queries
- Decimal(12,2) for monetary values (not Float)
- @@unique on registration(eventId, attendeeId)

## Seed Data

The seed script creates:
- Admin user with bcrypt-hashed password
- Viewer user for testing RBAC
- A venue for test events
- A published event (happy path)
- A cancelled event (error state data for testing)

See: authentication.md for password hashing
See: edge-cases.md for error state seeding
