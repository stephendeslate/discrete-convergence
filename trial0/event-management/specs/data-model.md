# Data Model Specification

## Overview
Prisma 6 schema with 14 models, 7 enums, all with @@map/@@index directives.
PostgreSQL 16 with Row Level Security on tenant-scoped tables.

## Models
- VERIFY:EM-SCHEMA-001 — Organization model with tier enum, @@map("organizations")
- VERIFY:EM-SCHEMA-002 — User model with role, tenantId, @@map("users"), @@index on tenantId+email
- VERIFY:EM-SCHEMA-003 — Event model with status, slug, dates, capacity, @@map("events"), @@index on tenantId+status
- VERIFY:EM-SCHEMA-004 — EventSession model for sub-events, @@map("event_sessions")
- VERIFY:EM-SCHEMA-005 — Venue model with capacity and location, @@map("venues")
- VERIFY:EM-SCHEMA-006 — TicketType model with pricing and quantity, @@map("ticket_types")
- VERIFY:EM-SCHEMA-007 — Registration model with status tracking, @@map("registrations")
- VERIFY:EM-SCHEMA-008 — RegistrationField custom fields, @@map("registration_fields")
- VERIFY:EM-SCHEMA-009 — RegistrationFieldValue for field responses, @@map("registration_field_values")
- VERIFY:EM-SCHEMA-010 — CheckIn model with timestamp, @@map("check_ins")
- VERIFY:EM-SCHEMA-011 — WaitlistEntry for capacity overflow, @@map("waitlist_entries")
- VERIFY:EM-SCHEMA-012 — Notification model with status/type, @@map("notifications")
- VERIFY:EM-SCHEMA-013 — AuditLog for compliance tracking, @@map("audit_logs")
- VERIFY:EM-SCHEMA-014 — All enums use @@map and @map on values (snake_case in DB)

## Enums
- OrganizationTier: FREE, PRO, ENTERPRISE
- UserRole: ADMIN, ORGANIZER, ATTENDEE
- EventStatus: DRAFT, PUBLISHED, CANCELLED, COMPLETED, SUSPENDED, ARCHIVED, SOLD_OUT, WAITLIST
- RegistrationStatus: PENDING, CONFIRMED, CANCELLED, WAITLISTED, CHECKED_IN, REFUNDED
- FieldType: TEXT, NUMBER, SELECT, CHECKBOX, DATE
- NotificationStatus: PENDING, SENT, FAILED
- NotificationType: EVENT_UPDATE, REGISTRATION_CONFIRM, REMINDER, CANCELLATION

## Indexes
- Every tenant-scoped model has @@index on tenantId
- Composite indexes: [tenantId, status] on events, [tenantId, email] on users
- Unique constraints: User(email), Event(slug), Registration(userId+eventId+ticketTypeId)

## Migrations
- VERIFY:EM-MIG-001 — Initial migration with RLS ENABLE + FORCE on users, events, venues, audit_logs

## Row Level Security
- All tenant-scoped tables have RLS enabled and forced
- Cross-reference: [security.md](./security.md) — RLS enforcement policies
- Cross-reference: [authentication.md](./authentication.md) — tenantId from JWT payload

## Seed Data
- VERIFY:EM-SEED-001 — Seed creates org, users (admin/organizer/attendee), venue, events
- VERIFY:EM-SEED-002 — Seed wrapped in try/catch with structured error output, no console.log

## Raw Query Safety
- VERIFY:EM-RAW-001 — Zero uses of $executeRawUnsafe anywhere in codebase

## Model Relationships
- Organization 1:N User, 1:N Event, 1:N Venue — all scoped by tenantId
- Event 1:N EventSession, 1:N TicketType, 1:N Registration, 1:N CheckIn
- Registration 1:N RegistrationFieldValue, linked to User + Event + TicketType
- RegistrationField belongs to Event; RegistrationFieldValue references RegistrationField
- WaitlistEntry links User to Event for capacity overflow tracking
- Notification belongs to Event with delivery status tracking
- AuditLog stores action, entity, entityId, userId for compliance trail
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — Services use these relationships for eager loading

## Naming Conventions
- All Prisma models use PascalCase in application code (e.g., TicketType)
- All tables use snake_case in PostgreSQL via @@map (e.g., ticket_types)
- All enum values use UPPER_CASE in Prisma, mapped to snake_case in DB via @map
- Foreign key fields follow the pattern: relatedModelId (e.g., eventId, userId, tenantId)
