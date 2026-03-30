# Data Model Specification

## Overview

Fleet Dispatch uses PostgreSQL with Prisma ORM. The schema defines six core
models for multi-tenant fleet management: User, Vehicle, Driver, Dispatch,
Route, and RouteStop. All models include tenantId for row-level isolation.

## Requirements

### Schema Design

- VERIFY: FD-DATA-013
  All models use @@map for snake_case table names and @map for column names.
  All enums use @@map for snake_case enum type names.
  Decimal type is used for monetary fields (estimatedCost on Dispatch).
  Composite indexes are defined on (tenantId, status) for key query patterns.

### Models

#### User Model
- Fields: id (UUID), email (unique), passwordHash, name, role (UserRole enum), tenantId
- Role enum: ADMIN, DISPATCHER, DRIVER, VIEWER
- Used for authentication and tenant scoping

#### Vehicle Model
- Fields: id (UUID), licensePlate, make, model, year, status (VehicleStatus enum), tenantId
- Status enum: ACTIVE, MAINTENANCE, RETIRED
- Indexed on tenantId and status for fleet queries

#### Driver Model
- Fields: id (UUID), name, licenseNumber, phone, status (DriverStatus enum), tenantId
- Status enum: AVAILABLE, ON_DUTY, OFF_DUTY, SUSPENDED
- Linked to dispatches for assignment tracking

#### Dispatch Model
- Fields: id (UUID), reference, pickupAddress, deliveryAddress, status, estimatedCost (Decimal), tenantId
- Status enum: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED
- Relations: driver (optional), vehicle (optional)

#### Route Model
- Fields: id (UUID), name, distance (Float), estimatedTime (Int minutes), status, tenantId
- Status enum: PLANNED, ACTIVE, COMPLETED, CANCELLED
- Has many RouteStop children

#### RouteStop Model
- Fields: id (UUID), routeId, address, sequence (Int), arrivalTime (optional)
- Ordered by sequence within a route

### Row-Level Security

- All six tables have RLS enabled with FORCE policy
- Policies use TEXT column comparison for tenantId (no ::uuid cast)
- SET LOCAL used for migration safety
- CREATE POLICY defined for every ENABLE ROW LEVEL SECURITY table

## Cross-References

- See [security.md](security.md) for RLS policy details
- See [api-endpoints.md](api-endpoints.md) for CRUD operations on each model
- See [infrastructure.md](infrastructure.md) for database connection configuration
