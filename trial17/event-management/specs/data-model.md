# Data Model Specification

## Overview

The event management platform uses PostgreSQL with Prisma ORM. The data model
supports multi-tenant isolation through tenantId foreign keys on all domain entities.
Row Level Security (RLS) policies enforce tenant isolation at the database level.

## Entities

### Tenant
The root entity for multi-tenant isolation. All other entities belong to a tenant.

### User
Authenticated users with email, hashed password, and role (ADMIN/VIEWER).

- VERIFY: EM-DATA-001 — UserRole enum with ADMIN and VIEWER values, mapped to snake_case
- VERIFY: EM-DATA-002 — EventStatus enum with DRAFT, PUBLISHED, CANCELLED, mapped to snake_case
- VERIFY: EM-DATA-003 — RegistrationStatus enum with PENDING, CONFIRMED, CANCELLED

### Event
Core domain entity representing scheduled events with title, dates, status, price, and capacity.

- VERIFY: EM-DATA-004 — PrismaService extends PrismaClient with onModuleInit/onModuleDestroy
- VERIFY: EM-DATA-005 — EventService uses $executeRaw with Prisma.sql for tenant context

### Venue
Physical locations where events are held, with name, address, and capacity.

### Attendee
People who attend events, with name, email, and optional phone number.

### Registration
Links attendees to events with a status tracking workflow (PENDING -> CONFIRMED/CANCELLED).

## Schema Conventions

All models use:
- `@@map('snake_case_table_name')` for table name mapping
- `@@index([tenantId])` on all tenant foreign keys
- `@@index([status])` on status fields
- `@@index([tenantId, status])` composite indexes
- `Decimal @db.Decimal(12, 2)` for monetary fields (never Float)
- All enums use `@@map` and `@map` for snake_case mapping

## Row Level Security

Every table has:
- `ENABLE ROW LEVEL SECURITY`
- `FORCE ROW LEVEL SECURITY`
- `CREATE POLICY` using `current_setting('app.current_tenant_id')` for TEXT column comparison

## Cross-References

- See [authentication.md](authentication.md) for User authentication flow
- See [api-endpoints.md](api-endpoints.md) for CRUD operations on each entity
- See [security.md](security.md) for RLS policy enforcement details
- See [infrastructure.md](infrastructure.md) for migration and seed configuration
