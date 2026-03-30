# Data Model Specification

> **Project:** Event Management
> **Domain:** DATA
> **VERIFY Tags:** EM-DATA-001 – EM-DATA-006

---

## Overview

PostgreSQL 16 database with Prisma 6 ORM. Multi-tenant isolation via
Row-Level Security (RLS) policies scoped by organizationId. All models use
snake_case table mapping via `@@map`. Monetary fields use `Decimal(12,2)`.

---

## Requirements

### EM-DATA-001: Prisma @@map on All Models

<!-- VERIFY: EM-DATA-001 -->

- Every Prisma model uses `@@map('snake_case_name')` for table mapping.
- Ensures consistent snake_case naming in the database layer.
- Models include: Organization, User, Event, Venue, TicketType, Registration,
  CheckIn, SyncHistory, DataSource, Dashboard, Widget, AuditLog.

### EM-DATA-002: Decimal for Monetary Fields

<!-- VERIFY: EM-DATA-002 -->

- Ticket prices use `@db.Decimal(12,2)` for precision.
- Prevents floating-point arithmetic errors in financial calculations.
- All monetary values stored as Decimal type, displayed in frontend.

### EM-DATA-003: Indexes on Foreign Keys

<!-- VERIFY: EM-DATA-003 -->

- `@@index([organizationId])` on all tenant-scoped models.
- `@@index([status])` on Event and Registration models.
- `@@index([eventId])` on TicketType and Registration.
- Composite indexes where queries benefit (e.g., `[organizationId, slug]`).

### EM-DATA-004: Row-Level Security

<!-- VERIFY: EM-DATA-004 -->

- Every tenant-scoped table has RLS ENABLE + FORCE.
- Policies use `current_setting('app.current_organization_id')::uuid`.
- `setTenantContext()` in PrismaService sets the config per transaction.
- RLS provides defense-in-depth alongside application-layer filtering.

### EM-DATA-005: User Email Unique Constraint

<!-- VERIFY: EM-DATA-005 -->

- User email field has `@unique` constraint.
- Prisma enforces uniqueness at the database level.
- Application catches unique constraint violations and returns 409 Conflict.

### EM-DATA-006: SyncHistory Tracks FAILED Status

<!-- VERIFY: EM-DATA-006 -->

- SyncHistory model records data source synchronization attempts.
- Status field captures SUCCESS or FAILED outcomes.
- FAILED entries include an `errorMessage` field with failure details.
- `recordsProcessed` tracks the count of records in each sync.
