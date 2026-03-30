# Drivers Specification

## Overview

Drivers are the personnel who operate fleet vehicles. Each driver has personal
information, a license number, and a status that determines their availability
for dispatch assignments.

## Data Model

### Fields
- id: UUID primary key
- name: string, required, max 255 characters
- email: string, required, valid email format
- phone: string, required, max 20 characters
- licenseNumber: string, required, max 50 characters
- status: DriverStatus enum (AVAILABLE, ON_DUTY, OFF_DUTY)
- tenantId: UUID, required, foreign key to tenant
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries
- @@index([status]) for availability filtering

## Endpoints

### GET /drivers
- Paginated list with tenant isolation
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Driver[], meta: { page, pageSize, total, totalPages } }

### POST /drivers
- Creates a new driver in the tenant context
- Body: { name, email, phone, licenseNumber }
- Validates all fields with class-validator decorators
- Creates audit log entry

### GET /drivers/:id
- Retrieves single driver by ID using findFirst (tenant-scoped query)
- Returns 404 if not found

### PUT /drivers/:id
- Updates driver fields
- Validates existence first

### DELETE /drivers/:id
- Checks if driver is ON_DUTY (rejects if so)
- Checks for active dispatches (ASSIGNED or IN_TRANSIT)
- Rejects if driver has active dispatches
- Creates audit log entry

### PATCH /drivers/:id/status
- Updates driver status with branching logic
- Rejects if already in target status
- Rejects OFF_DUTY to ON_DUTY transition (must go through AVAILABLE first)
- Creates audit log with status change details

## Business Rules

1. Drivers have three statuses: AVAILABLE, ON_DUTY, OFF_DUTY
2. Only AVAILABLE drivers can be assigned to dispatches
3. Cannot delete a driver who is currently ON_DUTY
4. Cannot delete a driver with active dispatches
5. OFF_DUTY drivers must be set to AVAILABLE before going ON_DUTY
6. When a dispatch is assigned, driver transitions to ON_DUTY
7. When a dispatch is completed or cancelled, driver returns to AVAILABLE
8. All operations are tenant-scoped via RLS

## DTOs

### CreateDriverDto
- @IsString() @MaxLength(255) name
- @IsEmail() email
- @IsString() @MaxLength(20) phone
- @IsString() @MaxLength(50) licenseNumber

### UpdateDriverDto
- All fields optional with same validations

## Cross-References

- See [Dispatches](dispatches.md) for dispatch assignment requiring AVAILABLE driver status
- See [Vehicles](vehicles.md) for vehicles assigned alongside drivers in dispatches
- See [Data Model](data-model.md) for DriverStatus enum definitions
