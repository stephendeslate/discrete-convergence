# Data Model Specification

> **Project:** Fleet Dispatch
> **Category:** DATA
> **Related:** See [api-endpoints.md](api-endpoints.md) for CRUD operations on these entities, see [infrastructure.md](infrastructure.md) for migrations and RLS

---

## Overview

The fleet dispatch data model supports multi-tenant fleet management with vehicles, drivers, routes, dispatches, and maintenance records. All entities are tenant-scoped via `tenantId` foreign key with Row Level Security enforced at the database level. Numeric precision fields use `Decimal(12,2)`.

---

## Requirements

### VERIFY:FD-DATA-001 — Prisma schema with @@map on all models

Every Prisma model uses `@@map('snake_case_table_name')` to ensure database table names follow PostgreSQL conventions. All fields use appropriate types: `String` for text, `Int` for counts, `Decimal @db.Decimal(12,2)` for numeric precision values, `DateTime` for timestamps.

### VERIFY:FD-DATA-002 — Enum mapping with @@map and @map

All Prisma enums use `@@map('snake_case_enum_name')` and each enum value uses `@map('UPPER_SNAKE_VALUE')` to maintain consistent naming between Prisma and PostgreSQL. Enums include `UserRole`, `VehicleStatus`, `DriverStatus`, `RouteStatus`, `DispatchStatus`, `MaintenanceType`, and `MaintenancePriority`.

### VERIFY:FD-DATA-003 — Indexes on tenantId, status, and composites

Every model with a `tenantId` field has `@@index([tenantId])`. Models with status fields have `@@index([status])`. Composite indexes `@@index([tenantId, status])` exist on Vehicle, Driver, and Dispatch for efficient filtered queries.

### VERIFY:FD-DATA-004 — Decimal for precision fields

All monetary and precision fields (fuel capacity, distance, maintenance cost) use `Decimal @db.Decimal(12, 2)`. The Float type is never used for money.

### VERIFY:FD-DATA-005 — Row Level Security in migrations

The initial migration includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY` for all tenant-scoped tables. RLS policies enforce that rows are only visible to users with matching `tenantId` set via `SET LOCAL app.current_tenant_id`. TEXT comparison is used — no `::uuid` cast.

### VERIFY:FD-DATA-006 — executeRaw for RLS with Prisma.sql

At least one service file uses `$executeRaw(Prisma.sql\`...\`)` to set the tenant context before queries. The `$executeRawUnsafe` method is never used anywhere in the codebase.

### VERIFY:FD-DATA-007 — Multi-tenant entity relationships

The User model is the root entity with tenant association. Vehicles, Drivers, Routes, Dispatches, and MaintenanceRecords all reference a tenant via `tenantId`. Dispatches reference Vehicle, Driver, and Route via foreign keys.

### VERIFY:FD-DATA-008 — Seed with error handling and shared imports

The seed file (`prisma/seed.ts`) imports `BCRYPT_SALT_ROUNDS` from the shared package for password hashing. It includes a `main()` function with `disconnect()` in finally, `console.error` + `process.exit(1)` error handling, and seeds at least one error/failure state record.

---

## Entity Summary

| Entity | Key Fields | Status Enum |
|--------|-----------|-------------|
| User | email, passwordHash, role, tenantId | UserRole: ADMIN, DISPATCHER, VIEWER |
| Vehicle | licensePlate, make, model, year, fuelCapacity | VehicleStatus: ACTIVE, MAINTENANCE, RETIRED |
| Driver | firstName, lastName, licenseNumber, phone | DriverStatus: AVAILABLE, ON_ROUTE, OFF_DUTY |
| Route | name, origin, destination, distanceKm | RouteStatus: ACTIVE, INACTIVE, PLANNED |
| Dispatch | vehicleId, driverId, routeId, status | DispatchStatus: PENDING, IN_TRANSIT, DELIVERED, CANCELLED |
| MaintenanceRecord | vehicleId, type, description, cost | MaintenanceType: OIL_CHANGE, TIRE_ROTATION, BRAKE_INSPECTION, ENGINE_REPAIR, GENERAL |
