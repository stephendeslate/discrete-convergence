# Data Model Specification

## Overview

The Fleet Dispatch data model is defined in Prisma schema and consists of
seven domain entities plus User and Zone. All entities include a companyId
field for multi-tenant isolation via PostgreSQL RLS.

## Shared Package

<!-- VERIFY:SHARED-INDEX -->
The shared package (`@fleet-dispatch/shared`) exports common types, constants,
and utilities used by both the API and web packages. The index file re-exports
all public modules.

<!-- VERIFY:SHARED-INDEX-SPEC -->
Unit tests verify that all shared exports are correctly re-exported from the
index file and that types are properly defined.

<!-- VERIFY:SHARED-CORRELATION -->
The correlation module provides utilities for generating and propagating
X-Correlation-ID values across service boundaries.

<!-- VERIFY:SHARED-ENV-VALIDATION -->
Environment validation utilities ensure required environment variables
(DATABASE_URL, JWT_SECRET, etc.) are present at startup with correct types.

<!-- VERIFY:SHARED-LOG-SANITIZER -->
The log sanitizer strips sensitive fields (password, token, authorization)
from log context objects before they are written to output.

<!-- VERIFY:SHARED-PAGINATION -->
Shared pagination types define the standard response shape for paginated
list endpoints including data array, total count, page, and pageSize.

## Zone Entity

<!-- VERIFY:API-ZONE-MODULE -->
The `ZoneModule` registers the zone service and controller for geographic
zone management within a company.

<!-- VERIFY:API-ZONE-CONTROLLER -->
The `ZoneController` maps HTTP methods to zone CRUD operations:
- `GET /zones` — List zones (paginated, company-scoped)
- `GET /zones/:id` — Get zone by ID
- `POST /zones` — Create zone (EDITOR or ADMIN)
- `PATCH /zones/:id` — Update zone (EDITOR or ADMIN)
- `DELETE /zones/:id` — Delete zone (ADMIN only)

<!-- VERIFY:API-ZONE-SERVICE -->
The `ZoneService` implements CRUD operations for geographic zones with
company scoping and pagination support.

<!-- VERIFY:API-ZONE-DTO -->
Zone DTOs define validation: name (required), boundaries (required),
description (optional). class-validator decorators enforce constraints.

## Core Entities

### User
- Fields: id (UUID), email, passwordHash, name, role (enum), companyId
- Role enum: ADMIN, EDITOR, VIEWER

### Vehicle
- Fields: id, vin, make, model, year, status (enum), licensePlate, companyId
- Status enum: ACTIVE, INACTIVE, MAINTENANCE

### Driver
- Fields: id, name, email, licenseNumber, status (enum), companyId
- Status enum: AVAILABLE, ON_TRIP, OFF_DUTY

### Route
- Fields: id, name, origin, destination, distanceKm, estimatedMinutes, companyId

### Dispatch
- Fields: id, vehicleId, driverId, routeId, status (enum), scheduledAt, companyId
- Status enum: PENDING, DISPATCHED, IN_TRANSIT, COMPLETED, CANCELLED

### Trip
- Fields: id, dispatchId, startedAt, completedAt, distanceKm, fuelUsedLiters, notes, companyId

### Maintenance
- Fields: id, vehicleId, type (enum), description, scheduledDate, completedDate, cost, companyId
- Type enum: ROUTINE, REPAIR, INSPECTION

### Zone
- Fields: id, name, boundaries, description, companyId

## Cross-References

- Prisma module: see [security.md](security.md)
- Entity endpoints: see [api-endpoints.md](api-endpoints.md)
- Tenant isolation: see [security.md](security.md)

<!-- VERIFY:ZONE-SERVICE-SPEC -->
