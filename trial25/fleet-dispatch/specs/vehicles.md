# Vehicles Specification

## Overview

Vehicles are the primary fleet assets managed by the platform. Each vehicle has a
name, plate number, type classification, capacity, and a status that determines
its availability for dispatch operations.

## Data Model

### Fields
- id: UUID primary key
- name: string, required, max 255 characters
- plateNumber: string, required, max 20 characters
- type: VehicleType enum (TRUCK, VAN, CAR, MOTORCYCLE)
- capacity: integer, required, min 1
- status: VehicleStatus enum (ACTIVE, INACTIVE, MAINTENANCE)
- tenantId: UUID, required, foreign key to tenant
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries
- @@index([status]) for status filtering

## Endpoints

### GET /vehicles
- Paginated list with tenant isolation
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Vehicle[], meta: { page, pageSize, total, totalPages } }

### POST /vehicles
- Creates a new vehicle in the tenant context
- Body: { name, plateNumber, type, capacity }
- Validates all fields with class-validator decorators
- Creates audit log entry
- Returns: created Vehicle object

### GET /vehicles/:id
- Retrieves single vehicle by ID
- Uses findFirst with tenant-scoped query
- Returns 404 if not found

### PUT /vehicles/:id
- Updates vehicle fields
- Validates existence first
- Creates audit log entry

### DELETE /vehicles/:id
- Deletes vehicle record
- Validates existence first
- Creates audit log entry

### PATCH /vehicles/:id/activate
- Transitions vehicle status to ACTIVE
- Rejects if already ACTIVE (BadRequestException)
- Rejects if in MAINTENANCE status (must complete maintenance first)
- Creates audit log with status change details

### PATCH /vehicles/:id/deactivate
- Transitions vehicle status to INACTIVE
- Rejects if already INACTIVE (BadRequestException)
- Checks for active dispatches (ASSIGNED or IN_TRANSIT)
- Rejects if vehicle has active dispatches
- Creates audit log with status change details

## Business Rules

1. Vehicles have three statuses: ACTIVE, INACTIVE, MAINTENANCE
2. Only ACTIVE vehicles can be assigned to dispatches
3. Cannot activate a vehicle that is already ACTIVE
4. Cannot activate a vehicle in MAINTENANCE (must complete maintenance first)
5. Cannot deactivate a vehicle with active dispatches
6. Emergency maintenance automatically sets vehicle to MAINTENANCE status
7. Completing maintenance restores vehicle to ACTIVE status
8. All operations are tenant-scoped via RLS

## DTOs

### CreateVehicleDto
- @IsString() @MaxLength(255) name
- @IsString() @MaxLength(20) plateNumber
- @IsString() @MaxLength(20) type
- @IsInt() @Min(1) @Max(100) capacity

### UpdateVehicleDto
- All fields optional with same validations

## Cross-References

- See [Dispatches](dispatches.md) for dispatch creation requiring ACTIVE vehicle status
- See [Maintenance](maintenance.md) for maintenance operations that change vehicle status
- See [Data Model](data-model.md) for VehicleType and VehicleStatus enum definitions
- See [Security](security.md) for tenant isolation via RLS policies
