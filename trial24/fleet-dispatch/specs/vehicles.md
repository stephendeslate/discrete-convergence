# Vehicles Specification

## Overview

CRUD operations for fleet vehicles. Each vehicle belongs to a company and is
isolated via RLS on `companyId`. See [dispatches.md](dispatches.md) for how
vehicles are assigned to dispatches.

## Module Structure

<!-- VERIFY:API-VEHICLE-MODULE -->
The `VehicleModule` registers the vehicle service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-VEHICLE-CONTROLLER -->
The `VehicleController` maps HTTP methods to service operations:
- `GET /vehicles` — List vehicles (paginated, company-scoped)
- `GET /vehicles/:id` — Get vehicle by ID
- `POST /vehicles` — Create vehicle (EDITOR or ADMIN)
- `PATCH /vehicles/:id` — Update vehicle (EDITOR or ADMIN)
- `DELETE /vehicles/:id` — Delete vehicle (ADMIN only)

<!-- VERIFY:API-VEHICLE-SERVICE -->
The `VehicleService` implements CRUD operations for vehicles with company
scoping. It supports pagination, status filtering, and validates VIN
uniqueness within the company.

<!-- VERIFY:API-VEHICLE-DTO -->
Vehicle DTOs define validation: vin (required string), make (required),
model (required), year (integer >= 1900), licensePlate (required),
status (optional enum, defaults to ACTIVE).

## Test Coverage

<!-- VERIFY:API-VEHICLE-SERVICE-SPEC -->
Unit tests for VehicleService cover creation, listing with pagination,
status filtering, VIN uniqueness, and company scoping.

<!-- VERIFY:TEST-VEHICLE-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for vehicle CRUD including
authentication, role authorization, and validation errors.

## Business Rules

- VIN must be unique within the company
- Year must be >= 1900 and <= current year + 1
- Status defaults to ACTIVE (enum: ACTIVE, INACTIVE, MAINTENANCE)
- All queries scoped by companyId
- Only ADMIN can delete vehicles

## Cross-References

- Dispatches using vehicles: see [dispatches.md](dispatches.md)
- Maintenance records: see [maintenance.md](maintenance.md)
- Security and RLS: see [security.md](security.md)
