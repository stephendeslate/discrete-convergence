# Data Model Specification

## Overview

Fleet Dispatch uses Prisma ORM with PostgreSQL. The schema defines five core entities
with tenant isolation enforced at both application and database (RLS) levels.
All monetary values use Decimal(12,2) for precision.

Cross-references: [security.md](security.md), [api-endpoints.md](api-endpoints.md)

## Entities

### User
- id: String (UUID, default cuid)
- email: String (unique)
- password: String (bcrypt hash)
- role: UserRole enum (ADMIN, VIEWER, DISPATCHER)
- tenantId: String
- createdAt: DateTime
- updatedAt: DateTime
- @@map("users"), @@index([tenantId])

### Vehicle
- id: String (UUID, default cuid)
- name: String
- licensePlate: String
- make: String
- model: String
- year: Int
- mileage: Int
- costPerMile: Decimal(12,2)
- status: VehicleStatus enum (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
- tenantId: String
- createdAt, updatedAt: DateTime
- dispatches: Dispatch[] relation
- @@map("vehicles"), @@index([tenantId]), @@index([tenantId, status])

### Route
- id: String (UUID, default cuid)
- name: String
- origin: String
- destination: String
- distanceMiles: Decimal(12,2)
- estimatedMinutes: Int
- status: RouteStatus enum (ACTIVE, INACTIVE, ARCHIVED)
- tenantId: String
- createdAt, updatedAt: DateTime
- dispatches: Dispatch[] relation
- @@map("routes"), @@index([tenantId]), @@index([tenantId, status])

### Driver
- id: String (UUID, default cuid)
- name: String
- licenseNumber: String
- phone: String
- status: DriverStatus enum (AVAILABLE, ON_DUTY, OFF_DUTY, SUSPENDED)
- tenantId: String
- createdAt, updatedAt: DateTime
- dispatches: Dispatch[] relation
- @@map("drivers"), @@index([tenantId]), @@index([tenantId, status])

### Dispatch
- id: String (UUID, default cuid)
- vehicleId: String (FK to Vehicle)
- routeId: String (FK to Route)
- driverId: String (FK to Driver)
- scheduledAt: DateTime
- completedAt: DateTime? (nullable)
- status: DispatchStatus enum (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- cost: Decimal(12,2)? (nullable)
- notes: String? (nullable)
- tenantId: String
- createdAt, updatedAt: DateTime
- vehicle, route, driver: relations
- @@map("dispatches"), @@index([tenantId]), @@index([tenantId, status])

## Row-Level Security

All tables have RLS enabled and forced. Policies restrict access by tenantId
passed via session variable (current_setting('app.tenant_id')). The migration
creates ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY for each table.

Cross-references: [security.md](security.md), [infrastructure.md](infrastructure.md)

## VERIFY Tags

- VERIFY: FD-DATA-001 — Prisma schema uses Decimal for money fields
- VERIFY: FD-DATA-002 — Raw queries use parameterized Prisma.sql template

## Migration Strategy

Initial migration (20240101000000_init) creates all tables, enums, indexes,
and RLS policies. Subsequent migrations handled via prisma migrate dev.
Seed script creates sample data with proper tenant isolation and bcrypt hashing.
