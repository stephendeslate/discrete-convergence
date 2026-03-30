# Data Model Specification

## Overview

Fleet Dispatch uses PostgreSQL 16 with Prisma ORM. All models use @@map
for snake_case table names. Enums use @@map and @map for consistent naming.
Monetary fields use Decimal @db.Decimal(12, 2). See [api-endpoints.md](api-endpoints.md)
for API operations on these entities.

## Prisma Service

- VERIFY: FD-DATA-001 — PrismaService extends PrismaClient with OnModuleInit/OnModuleDestroy

## Raw SQL Operations

- VERIFY: FD-DATA-002 — DispatchService uses $executeRaw with Prisma.sql for dispatch stats

## Entity: User

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| tenantId | UUID | Foreign key to Tenant |
| email | String | Unique, max 255 |
| passwordHash | String | Bcrypt hash |
| role | UserRole | Default: VIEWER |
| name | String | Max 255 |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-updated |

## Entity: Tenant

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Max 255 |
| createdAt | DateTime | Auto-generated |
| updatedAt | DateTime | Auto-updated |

## Entity: Vehicle

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant, indexed |
| licensePlate | String | Max 20 |
| make | String | Max 100 |
| model | String | Max 100 |
| year | Int | Minimum 1900 |
| status | VehicleStatus | Default: AVAILABLE |
| mileage | Decimal(12,2) | Non-negative |
| fuelCostPerKm | Decimal(12,2) | Non-negative |

## Entity: Driver

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant, indexed |
| name | String | Max 255 |
| licenseNumber | String | Max 50 |
| phone | String | Max 20 |
| status | DriverStatus | Default: ACTIVE |

## Entity: Route

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant, indexed |
| name | String | Max 255 |
| origin | String | Max 255 |
| destination | String | Max 255 |
| distanceKm | Decimal(12,2) | Non-negative |
| status | RouteStatus | Default: PLANNED |

## Entity: Dispatch

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant |
| vehicleId | UUID | FK to Vehicle |
| driverId | UUID | FK to Driver |
| routeId | UUID | FK to Route |
| dispatcherId | UUID | FK to User |
| status | DispatchStatus | Default: PENDING |
| scheduledAt | DateTime | Required |
| completedAt | DateTime | Nullable |
| notes | Text | Nullable |
| totalCost | Decimal(12,2) | Default: 0 |

## Entity: MaintenanceRecord

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant |
| vehicleId | UUID | FK to Vehicle |
| type | MaintenanceType | Required |
| description | Text | Required |
| cost | Decimal(12,2) | Non-negative |
| performedAt | DateTime | Required |

## Entity: AuditLog

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | FK to Tenant |
| userId | UUID | FK to User |
| action | String | Max 100 |
| entity | String | Max 100 |
| entityId | UUID | Required |
| metadata | Text | Nullable |

## Indexes

- All tenantId foreign keys have @@index
- Status fields have @@index
- Composite indexes on (tenantId, status) for all domain entities
- Row Level Security enabled and forced on all tables

## Enums

- UserRole: ADMIN, DISPATCHER, DRIVER, VIEWER
- VehicleStatus: AVAILABLE, IN_USE, MAINTENANCE, RETIRED
- DriverStatus: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
- RouteStatus: PLANNED, ACTIVE, COMPLETED, CANCELLED
- DispatchStatus: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED
- MaintenanceType: PREVENTIVE, CORRECTIVE, EMERGENCY
