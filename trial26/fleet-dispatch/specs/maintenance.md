# Maintenance Specification

## Overview

Maintenance records track vehicle servicing activities. The maintenance system
has special integration with vehicle status management, particularly for
emergency maintenance scenarios.

## Data Model

### Fields
- id: UUID primary key
- vehicleId: UUID, required, foreign key to Vehicle
- type: MaintenanceType enum (SCHEDULED, EMERGENCY, PREVENTIVE)
- description: string, optional, max 1000 characters
- scheduledDate: timestamp, required
- completedDate: timestamp, nullable
- cost: decimal, optional
- status: string (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- tenantId: UUID, required
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries
- @@index([vehicleId]) for vehicle maintenance history

## Endpoints

### GET /maintenance
- Paginated list with tenant isolation
- Includes related vehicle data
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Maintenance[], meta: PaginationMeta }

### POST /maintenance
- Creates maintenance record
- Body: { vehicleId, type, description?, scheduledDate, cost? }
- Validates vehicle exists via findFirst (tenant-scoped query)
- For EMERGENCY type: sets vehicle status to MAINTENANCE
- Creates audit log entry

### GET /maintenance/:id
- Retrieves single maintenance record by ID
- Uses findFirst with tenant-scoped query
- Includes related vehicle data
- Returns 404 if not found

### PUT /maintenance/:id
- Updates maintenance fields
- Rejects update on COMPLETED maintenance
- Rejects update on CANCELLED maintenance
- Creates audit log entry

### PATCH /maintenance/:id/complete
- Marks maintenance as COMPLETED
- Sets completedDate to current timestamp
- Rejects if already COMPLETED
- Rejects if CANCELLED
- Checks vehicle current status via findFirst (tenant-scoped query)
- Restores vehicle to ACTIVE if currently in MAINTENANCE
- Creates audit log with status change details

## Business Rules

1. Three maintenance types: SCHEDULED, EMERGENCY, PREVENTIVE
2. EMERGENCY maintenance automatically sets vehicle status to MAINTENANCE
3. Completing maintenance restores vehicle to ACTIVE (if in MAINTENANCE)
4. Cannot update completed maintenance records
5. Cannot update cancelled maintenance records
6. Cannot complete cancelled maintenance
7. All operations include vehicle relationship data
8. All mutations are audited

## DTOs

### CreateMaintenanceDto
- @IsString() @MaxLength(36) vehicleId
- @IsString() @MaxLength(20) type
- @IsOptional() @IsString() @MaxLength(1000) description
- @IsDateString() scheduledDate
- @IsOptional() @IsNumber() cost

### UpdateMaintenanceDto
- All fields optional with same validations
