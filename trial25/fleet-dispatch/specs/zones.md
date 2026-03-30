# Zones Specification

## Overview

Zones define geographical areas used to organize fleet operations. Each zone has
a name, description, and boundary coordinates stored as JSON. Zones help fleet
managers segment their operational territory.

## Data Model

### Fields
- id: UUID primary key
- name: string, required, max 255 characters
- description: string, optional, max 1000 characters
- boundaries: Json, required (GeoJSON-like boundary definition)
- tenantId: UUID, required
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId]) for tenant isolation queries

## Endpoints

### GET /zones
- Paginated list with tenant isolation
- Query params: page (default 1), pageSize (default 20)
- Returns: { data: Zone[], meta: PaginationMeta }
- Ordered by createdAt descending

### POST /zones
- Creates a new zone in the tenant context
- Body: { name, description?, boundaries }
- Validates all fields with class-validator decorators
- Creates audit log entry with zone name

### GET /zones/:id
- Retrieves single zone by ID
- Uses findFirst with tenant-scoped query
- Returns 404 if not found within tenant

### PUT /zones/:id
- Updates zone fields
- Validates zone existence first via findOne
- Creates audit log entry

### DELETE /zones/:id
- Deletes zone record
- Validates zone existence first via findOne
- Creates audit log entry

## Business Rules

1. Zones are organizational units for fleet territory management
2. Zone names should be unique within a tenant
3. Boundaries are stored as JSON for flexibility
4. Zones can be created, updated, and deleted independently
5. All operations are tenant-scoped via Row-Level Security
6. Audit logging tracks all zone mutations

## DTOs

### CreateZoneDto
- @IsString() @MaxLength(255) name
- @IsOptional() @IsString() @MaxLength(1000) description
- @IsObject() boundaries (JSON object with coordinates)

### UpdateZoneDto
- All fields optional with same validations
- Partial update supported
