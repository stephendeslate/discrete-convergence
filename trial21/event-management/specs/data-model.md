# Data Model Specification

## Overview
The Event Management Platform uses Prisma 6 with PostgreSQL.
All models use snake_case table names via @@map.
Enums use @@map and @map for database naming.

## Core Entities

### Organization (tenant)
- Fields: id, name, tier, createdAt, updatedAt
- Relations: users, events, venues, auditLogs
- Tier limits: FREE (5/month), PRO (50/month), ENTERPRISE (unlimited)

### User
- Fields: id, email, passwordHash, firstName, lastName, role, organizationId
- Indexes: @@index([organizationId]), @@index([email])
- Roles: ADMIN, ORGANIZER, ATTENDEE

### Event
- Fields: id, title, slug (unique), description, status, timezone, startDate, endDate, organizationId, venueId
- Status: DRAFT -> PUBLISHED -> REGISTRATION_OPEN -> REGISTRATION_CLOSED -> IN_PROGRESS -> COMPLETED -> ARCHIVED
- CANCELLED from any state except COMPLETED
- Indexes: @@index([organizationId]), @@index([status]), @@index([slug]), @@index([organizationId, status])

### EventSession
- Fields: id, title, startTime, endTime, eventId
- Session times must be within parent event window (see [api-endpoints.md](api-endpoints.md))

### Venue
- Fields: id, name, address, capacity, organizationId
- Event capacity = sum of ticket type quotas

### TicketType
- Fields: id, name, price (Int, cents), quota, eventId
- Price stored as integer cents (see [api-endpoints.md](api-endpoints.md))

### Registration
- Fields: id, status, userId, eventId, ticketTypeId
- Status: PENDING -> CONFIRMED -> CHECKED_IN, CANCELLED, WAITLISTED -> PROMOTED -> CONFIRMED
- Indexes: @@index([userId]), @@index([eventId]), @@index([status]), @@index([eventId, status])

### Additional Entities
- RegistrationField: custom fields (TEXT, EMAIL, PHONE, SELECT, CHECKBOX)
- RegistrationFieldValue: field values per registration
- CheckIn: check-in records with timestamp
- WaitlistEntry: FIFO queue per event
- Notification: user notifications
- NotificationTemplate: reusable templates
- AuditLog: action tracking per organization

## Row-Level Security
- ENABLE + FORCE + CREATE POLICY on tenant-scoped tables
- tenant_id is TEXT, no ::uuid cast
- See [security.md](security.md) for RLS policies

## VERIFY Tags
- EM-DM-001: Prisma schema with @@map on all models
- EM-DM-002: Enum @@map and @map for database naming
- EM-DM-003: Composite indexes on tenantId/status

## Cross-References
- [api-endpoints.md](api-endpoints.md) — CRUD operations per entity
- [security.md](security.md) — RLS policies
- [authentication.md](authentication.md) — User model and password storage
