# Trips Specification

## Overview

Trips represent individual journey segments within a dispatch. A trip records
the actual start and end locations, timing, and distance covered. Trips are
linked to dispatches and track the real-time progress of fleet operations.

## Data Model

### Fields
- id: UUID primary key
- dispatchId: UUID, required, foreign key to Dispatch
- startLocation: string, required, max 255 characters
- endLocation: string, required, max 255 characters
- startTime: timestamp, required
- endTime: timestamp, nullable (set on completion)
- distance: float, nullable (recorded on completion)
- status: string (ACTIVE, COMPLETED, CANCELLED)
- tenantId: UUID, required
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries
- @@index([dispatchId]) for dispatch trip history

## Endpoints

### GET /trips
- Paginated list with tenant isolation
- Includes related dispatch data
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Trip[], meta: PaginationMeta }
- Ordered by createdAt descending

### POST /trips
- Creates a trip linked to a dispatch
- Body: { dispatchId, startLocation, endLocation, startTime }
- Validates dispatch exists via findFirst (tenant-scoped query)
- Rejects if dispatch is CANCELLED
- Rejects if dispatch is COMPLETED
- If dispatch is ASSIGNED, transitions it to IN_TRANSIT
- Creates audit log entry with dispatchId

### GET /trips/:id
- Retrieves single trip by ID
- Uses findFirst with tenant-scoped query
- Includes related dispatch data
- Returns 404 if not found

### PATCH /trips/:id/complete
- Marks trip as COMPLETED
- Accepts optional distance parameter
- Sets endTime to current timestamp
- Rejects if already COMPLETED
- Rejects if CANCELLED
- Creates audit log with status change and distance

## Business Rules

1. Trips are linked to dispatches (many-to-one relationship)
2. Cannot create trip for a cancelled dispatch
3. Cannot create trip for a completed dispatch
4. Creating a trip for an ASSIGNED dispatch transitions it to IN_TRANSIT
5. Trip completion records actual end time and distance
6. Cannot complete an already completed trip
7. Cannot complete a cancelled trip
8. All operations include related dispatch data
9. All mutations are audited with user and tenant context

## DTOs

### CreateTripDto
- @IsString() @MaxLength(36) dispatchId
- @IsString() @MaxLength(255) startLocation
- @IsString() @MaxLength(255) endLocation
- @IsDateString() startTime

### UpdateTripDto
- @IsOptional() @IsString() @MaxLength(255) startLocation
- @IsOptional() @IsString() @MaxLength(255) endLocation
- @IsOptional() @IsDateString() endTime
- @IsOptional() @IsNumber() @Min(0) distance
