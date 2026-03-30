# Data Model Specification

## Overview

The Event Management platform uses Prisma 6 ORM with PostgreSQL 16.
All models support multi-tenancy through a tenantId field with Row Level Security.
Data model security is enforced per [security.md](security.md).
Frontend data access uses server actions described in [frontend.md](frontend.md).

## Requirements

### EM-DATA-001 — Core Entities
The data model includes: Organization (implicit via tenantId), User, Event, Ticket, Venue,
Attendee, Speaker, Session, Sponsor, and AuditLog.
All Prisma models use @@map("snake_case") for PostgreSQL table naming conventions.
All enum values use @map for PostgreSQL naming conventions.
<!-- VERIFY:EM-DATA-001 — All core entities defined with @@map snake_case table names -->

### EM-DATA-002 — Multi-Tenancy
Every tenanted table has a tenant_id column indexed for query performance.
Row Level Security (RLS) is enabled with ENABLE + FORCE on all tenanted tables.
RLS policies filter rows using current_setting('app.tenant_id', true).
PrismaService.setTenantContext called before every tenant-scoped query.
<!-- VERIFY:EM-DATA-002 — RLS enabled and enforced on all tenanted tables -->

### EM-DATA-003 — Enum Types
All enums use @map and @@map for PostgreSQL naming:
- Role: ADMIN, ORGANIZER, VIEWER
- EventStatus: DRAFT, PUBLISHED, CANCELLED, COMPLETED
- TicketType: GENERAL, VIP, EARLY_BIRD
- TicketStatus: AVAILABLE, SOLD, CANCELLED, REFUNDED
- SessionStatus: DRAFT, CONFIRMED, CANCELLED
- SponsorTier: GOLD, SILVER, BRONZE
- AuditAction: CREATE, UPDATE, DELETE, LOGIN
<!-- VERIFY:EM-DATA-003 — All enums defined with @map PostgreSQL naming -->

### EM-DATA-004 — Indexes
Composite indexes on frequently queried fields including tenantId and foreign keys.
All foreign key columns have individual indexes for join performance.
Status fields have indexes for filtered queries.
<!-- VERIFY:EM-DATA-004 — Indexes defined on tenantId and foreign key columns -->

### EM-DATA-005 — Audit Trail
AuditLog records all significant operations (CREATE, UPDATE, DELETE, LOGIN).
Each audit entry captures: action, entity, entityId, details (JSON), userId, tenantId.
Audit log entries are immutable once created.
<!-- VERIFY:EM-DATA-005 — Audit log captures all domain operations with full context -->

### EM-DATA-006 — Tenant Context Setting
PrismaService provides setTenantContext method using $executeRaw with parameterized query.
Never uses $executeRawUnsafe for SQL injection prevention.
Tenant context set per-transaction using PostgreSQL set_config.
<!-- VERIFY:EM-DATA-006 — Tenant context set via parameterized $executeRaw, not $executeRawUnsafe -->

## Relationships

- Event belongs to Venue (optional), has many Tickets, Attendees, Sessions, Sponsors
- Ticket belongs to Event and optionally to Attendee
- Session belongs to Event and optionally to Speaker
- Sponsor belongs to Event
- AuditLog belongs to User
- User has many AuditLogs
