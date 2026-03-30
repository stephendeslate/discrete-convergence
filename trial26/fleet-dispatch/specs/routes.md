# Routes Specification

## Overview

Routes define the paths that dispatched vehicles follow. Each route has a name,
description, start and end points, distance, and estimated duration. Routes are
referenced by dispatches to define the planned journey.

## Data Model

### Fields
- id: UUID primary key
- name: string, required, max 255 characters
- description: string, optional, max 1000 characters
- startPoint: string, required, max 255 characters
- endPoint: string, required, max 255 characters
- distance: float, optional (in kilometers)
- estimatedDuration: integer, optional (in minutes)
- tenantId: UUID, required
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries

## Endpoints

### GET /routes
- Paginated list with tenant isolation
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Route[], meta: { page, pageSize, total, totalPages } }
- Ordered by createdAt descending

### POST /routes
- Creates a new route in the tenant context
- Body: { name, description?, startPoint, endPoint, distance?, estimatedDuration? }
- Validates all fields with class-validator decorators
- Creates audit log entry with route name

### GET /routes/:id
- Retrieves single route by ID
- Uses findFirst with tenant-scoped query
- Returns 404 if not found within tenant

### PUT /routes/:id
- Updates route fields
- Validates route existence first via findOne
- Creates audit log entry

### DELETE /routes/:id
- Deletes route record
- Validates route existence first via findOne
- Creates audit log entry
- Note: does not check for active dispatches using this route

## Business Rules

1. Routes are static definitions reusable across multiple dispatches
2. Route names should be descriptive of the journey
3. Distance is measured in kilometers
4. Estimated duration is measured in minutes
5. Routes can be created, updated, and deleted independently of dispatches
6. All operations are tenant-scoped via Row-Level Security
7. Audit logging tracks all route mutations

## DTOs

### CreateRouteDto
- @IsString() @MaxLength(255) name
- @IsOptional() @IsString() @MaxLength(1000) description
- @IsString() @MaxLength(255) startPoint
- @IsString() @MaxLength(255) endPoint
- @IsOptional() @IsNumber() distance
- @IsOptional() @IsInt() estimatedDuration

### UpdateRouteDto
- All fields optional with same validations
