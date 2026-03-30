# Data Model Specification

## Overview

The Event Management platform uses PostgreSQL 16 with Prisma ORM for data access.
The schema enforces multi-tenant isolation via organizationId foreign keys and Row Level Security.
See [security.md](security.md) for RLS policy details.

## Core Entities

### Organization
- Tenant entity with name, slug (unique), tier (FREE/PRO/ENTERPRISE)
- All other entities reference an organization directly or transitively

### User
- Authenticated user with email, passwordHash, name, role (ADMIN/ORGANIZER/ATTENDEE)
- Unique constraint on (email, organizationId) for per-tenant email uniqueness
- Indexes on organizationId, role, and composite (organizationId, role)

### Event
- Central domain entity with title, description, slug, status, timezone, dates, capacity
- Status follows lifecycle: DRAFT -> PUBLISHED -> REGISTRATION_OPEN -> REGISTRATION_CLOSED -> IN_PROGRESS -> COMPLETED -> ARCHIVED
- CANCELLED is reachable from any state except COMPLETED
- Unique constraint on (slug, organizationId) for per-tenant slugs
- Indexes on organizationId, status, and composite (organizationId, status)

### Venue
- Physical or virtual location with name, address, city, capacity, isVirtual, virtualUrl
- Referenced by events via optional venueId foreign key

### TicketType
- Ticket tier with name, description, price (Decimal), quota, soldCount
- Price stored as Decimal @db.Decimal(12, 2) — never Float

### Registration
- Links user to event + ticket type with status tracking
- Status: PENDING -> CONFIRMED -> CHECKED_IN, or CANCELLED, or WAITLISTED -> PROMOTED -> CONFIRMED

### CheckIn
- Records QR-scanned check-in with timestamp and staff user reference
- Idempotent — scanning twice returns "already checked in"

### WaitlistEntry
- Queue for sold-out ticket types, ordered by createdAt (FIFO)
- Composite index on (eventId, promoted)

### Notification
- Queued email with subject, body, recipientEmail, status (QUEUED/SENT/FAILED)
- Indexes on organizationId, status, and composite (organizationId, status)

### AuditLog
- Immutable action log with action, entityType, entityId, userId, metadata
- Indexes on organizationId, entityType, and composite (organizationId, entityType)

## Requirements

### VERIFY:EM-DATA-001
At least one service must use $executeRaw(Prisma.sql`...`) for raw SQL operations.
Zero $executeRawUnsafe calls allowed in the codebase.

### VERIFY:EM-DATA-002
Migration must include ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
for all tables that contain tenant-scoped data.

## Naming Conventions

- All models use @@map('snake_case_table_name')
- All enums use @@map('snake_case_enum_name') with @map('snake_case_value') on values
- All column names use @map('snake_case') where Prisma field name differs

## Indexes

- @@index on all organizationId foreign keys
- @@index on status fields (events, registrations, notifications)
- @@index on composite (organizationId, status) for filtered tenant queries
- @@index on all foreign keys used in joins (eventId, userId, etc.)
