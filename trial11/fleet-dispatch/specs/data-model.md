# Data Model Specification

## Overview

Fleet Dispatch uses Prisma ORM with PostgreSQL. All models follow strict naming
conventions with @@map for table names and @map for enum values. Multi-tenant
isolation is enforced via tenant_id columns and Row Level Security policies.

## Entities

### User
- id: String (UUID, @default(uuid()))
- email: String (unique)
- passwordHash: String
- role: UserRole (enum)
- tenantId: String
- createdAt: DateTime
- updatedAt: DateTime

### Vehicle
- VERIFY: FD-DATA-001 — Vehicle model with @@map('vehicles') and @@index on tenantId
- id: String (UUID)
- name: String
- licensePlate: String
- status: VehicleStatus (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
- tenantId: String
- mileage: Decimal @db.Decimal(12, 2)
- createdAt, updatedAt: DateTime

### Driver
- VERIFY: FD-DATA-002 — Driver model with @@map('drivers') and @@index on tenantId
- id: String (UUID)
- name: String
- licenseNumber: String
- phone: String
- status: DriverStatus (ACTIVE, INACTIVE, ON_LEAVE)
- tenantId: String
- userId: String (optional, links to User)
- createdAt, updatedAt: DateTime

### Dispatch
- VERIFY: FD-DATA-003 — Dispatch model with @@map('dispatches') and composite index
- id: String (UUID)
- vehicleId: String (FK to Vehicle)
- driverId: String (FK to Driver)
- origin: String
- destination: String
- status: DispatchStatus (PENDING, IN_TRANSIT, COMPLETED, CANCELLED)
- scheduledAt: DateTime
- completedAt: DateTime (optional)
- cost: Decimal @db.Decimal(12, 2)
- notes: String (optional)
- tenantId: String
- createdAt, updatedAt: DateTime

## Enums

- VERIFY: FD-DATA-004 — All enums use @@map with @map on each value
- UserRole: ADMIN, DISPATCHER, DRIVER
- VehicleStatus: AVAILABLE, IN_USE, MAINTENANCE, RETIRED
- DriverStatus: ACTIVE, INACTIVE, ON_LEAVE
- DispatchStatus: PENDING, IN_TRANSIT, COMPLETED, CANCELLED

## Indexes

- VERIFY: FD-DATA-005 — @@index on tenantId for all domain models
- VERIFY: FD-DATA-006 — @@index on status for Vehicle, Driver, Dispatch
- VERIFY: FD-DATA-007 — Composite @@index on [tenantId, status] for query performance

## Row Level Security

RLS policies enforce tenant isolation at the database level.
See [Security Specification](security.md) for full RLS policy details.

- VERIFY: FD-DATA-008 — ENABLE ROW LEVEL SECURITY on all domain tables
- VERIFY: FD-DATA-009 — FORCE ROW LEVEL SECURITY on all domain tables
- VERIFY: FD-DATA-010 — CREATE POLICY for tenant isolation on each table

## Monetary Fields

- VERIFY: FD-DATA-011 — All monetary fields use Decimal @db.Decimal(12, 2), never Float

## Naming Conventions

All models use @@map('snake_case_table_name') for PostgreSQL table names.
All enums use @@map('snake_case_enum_name') for PostgreSQL type names.
All enum values use @map('snake_case_value') for PostgreSQL value names.

## Migration Safety

Migrations include RLS setup with a dummy tenant_id setting to allow
policy creation without runtime context:
```sql
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';
```
