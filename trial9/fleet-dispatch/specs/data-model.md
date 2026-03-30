# Data Model Specification

## Overview

Fleet Dispatch uses Prisma ORM with PostgreSQL 16. The schema defines
six domain models with proper indexing, enum types, and row-level security.
All monetary fields use `Decimal(12,2)` for precision.

## Models

### User

Fields: id (UUID), email (unique), passwordHash, name, role (UserRole enum),
tenantId (TEXT), createdAt, updatedAt.
Indexes: tenantId, email.
Maps to `users` table via `@@map`.

### Vehicle

<!-- VERIFY: FD-VEH-001 -->
The CreateVehicleDto validates vehicle creation input with class-validator
decorators: vin, make, model, year, licensePlate, status, type.

<!-- VERIFY: FD-VEH-002 -->
VehicleService provides CRUD operations scoped by tenantId:
- findAll with pagination (parsePagination from shared)
- findOne by id and tenantId
- create, update, delete with tenant scoping
- getFleetStats using $executeRaw for aggregate queries

<!-- VERIFY: FD-VEH-003 -->
VehicleController exposes RESTful endpoints with Cache-Control headers.
The delete endpoint requires ADMIN role via `@Roles('ADMIN')`.

### Driver

<!-- VERIFY: FD-DRV-001 -->
CreateDriverDto validates driver fields: firstName, lastName, email,
licenseNumber, licenseExpiry, phone, status.

<!-- VERIFY: FD-DRV-002 -->
DriverService provides tenant-scoped CRUD with pagination support.

<!-- VERIFY: FD-DRV-003 -->
DriverController exposes RESTful endpoints with tenant scoping.

### Route

<!-- VERIFY: FD-RTE-001 -->
CreateRouteDto validates route fields: name, origin, destination,
distance, estimatedDuration, status.

<!-- VERIFY: FD-RTE-002 -->
RouteService provides tenant-scoped CRUD with pagination.

<!-- VERIFY: FD-RTE-003 -->
RouteController exposes RESTful endpoints with tenant scoping.

### Dispatch

<!-- VERIFY: FD-DSP-001 -->
CreateDispatchDto validates dispatch fields: vehicleId, driverId,
routeId, scheduledAt, status, notes.

<!-- VERIFY: FD-DSP-002 -->
DispatchService provides tenant-scoped CRUD with vehicle/driver/route includes.

<!-- VERIFY: FD-DSP-003 -->
DispatchController exposes RESTful endpoints with tenant scoping.

### Maintenance

<!-- VERIFY: FD-MNT-001 -->
CreateMaintenanceDto validates maintenance fields: vehicleId, type,
description, scheduledDate, cost (Decimal), status.

<!-- VERIFY: FD-MNT-002 -->
MaintenanceService provides tenant-scoped CRUD with vehicle includes.

<!-- VERIFY: FD-MNT-003 -->
MaintenanceController exposes RESTful endpoints with tenant scoping.

## Database Operations

<!-- VERIFY: FD-DATA-001 -->
Health readiness check uses `$queryRaw` to verify database connectivity
with `SELECT 1` query in the monitoring controller.

<!-- VERIFY: FD-DATA-002 -->
Fleet statistics use `$executeRaw` for aggregate queries that count
vehicles by status, grouped by tenant.

## Cross-References

- See [security.md](security.md) for RLS policies on all tables
- See [api-endpoints.md](api-endpoints.md) for endpoint-to-model mapping
