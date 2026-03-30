# Data Model Specification

## Overview
Fleet Dispatch uses PostgreSQL with Prisma ORM. All models support multi-tenancy
via tenantId field with Row Level Security policies.

## Entities

### User
- id: UUID (primary key)
- email: unique string
- passwordHash: string (bcrypt)
- role: UserRole enum (ADMIN, USER, DISPATCHER)
- tenantId: UUID
- Indexes: tenantId, email

### Vehicle
- id: UUID (primary key)
- vin: unique string (17 chars)
- make, model: string
- year: integer
- status: VehicleStatus enum (ACTIVE, MAINTENANCE, RETIRED)
- mileage: integer
- tenantId: UUID
- Relations: trips[], maintenance[]
- VERIFY: FD-VEH-007 - Paginated vehicle listing
- VERIFY: FD-VEH-008 - Find vehicle by id with tenant scope
- VERIFY: FD-VEH-010 - Create vehicle with tenant scope
- VERIFY: FD-VEH-012 - Delete vehicle with tenant scope
- VERIFY: FD-VEH-014 - Maintenance cost report via raw query
- Indexes: tenantId, status, composite (tenantId, status)

### Driver
- id: UUID (primary key)
- licenseNumber: unique string
- name: string
- status: DriverStatus enum (ACTIVE, ON_LEAVE, TERMINATED)
- certifications: string[]
- tenantId: UUID
- Relations: trips[]
- VERIFY: FD-DRV-001 - Paginated driver listing
- VERIFY: FD-DRV-002 - Find driver by id with tenant scope
- VERIFY: FD-DRV-004 - Create driver with tenant scope
- Indexes: tenantId, status, composite (tenantId, status)

### Route
- id: UUID (primary key)
- name, origin, destination: string
- distance: Decimal(12,2)
- estimatedDuration: integer (minutes)
- tenantId: UUID
- Relations: trips[]
- VERIFY: FD-RTE-001 - Fetch routes with authentication
- Indexes: tenantId

### Trip
- id: UUID (primary key)
- vehicleId, driverId, routeId: UUID (foreign keys)
- status: TripStatus enum (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- startTime, endTime: DateTime (nullable)
- tenantId: UUID
- Relations: vehicle, driver, route
- VERIFY: FD-TRP-001 - Fetch trips with authentication
- Indexes: tenantId, status, composite (tenantId, status), vehicleId, driverId, routeId

### Maintenance
- id: UUID (primary key)
- vehicleId: UUID (foreign key)
- type: MaintenanceType enum (SCHEDULED, UNSCHEDULED, EMERGENCY)
- cost: Decimal(12,2)
- date: DateTime
- notes: string (nullable)
- tenantId: UUID
- Relations: vehicle
- VERIFY: FD-MNT-001 - Fetch maintenance with authentication
- Indexes: tenantId, composite (tenantId, vehicleId)

## Row Level Security
All tables have RLS enabled and forced with tenant isolation policies.

## Cross-References
- See [security.md](security.md) for RLS policy details
- See [api-endpoints.md](api-endpoints.md) for CRUD operations
