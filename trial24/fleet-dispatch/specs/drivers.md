# Drivers Specification

## Overview

CRUD operations for fleet drivers. Each driver belongs to a company and is
isolated via RLS on `companyId`. See [dispatches.md](dispatches.md) for how
drivers are assigned to dispatches.

## Module Structure

<!-- VERIFY:API-DRIVER-MODULE -->
The `DriverModule` registers the driver service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-DRIVER-CONTROLLER -->
The `DriverController` maps HTTP methods to service operations:
- `GET /drivers` — List drivers (paginated, company-scoped)
- `GET /drivers/:id` — Get driver by ID
- `POST /drivers` — Create driver (EDITOR or ADMIN)
- `PATCH /drivers/:id` — Update driver (EDITOR or ADMIN)
- `DELETE /drivers/:id` — Delete driver (ADMIN only)

<!-- VERIFY:API-DRIVER-SERVICE -->
The `DriverService` implements CRUD operations for drivers with company
scoping. It supports pagination and status filtering.

<!-- VERIFY:API-DRIVER-DTO -->
Driver DTOs define validation: name (required), email (required, IsEmail),
licenseNumber (required), status (optional enum, defaults to AVAILABLE).

## Test Coverage

<!-- VERIFY:API-DRIVER-SERVICE-SPEC -->
Unit tests for DriverService cover creation, listing with pagination,
status filtering, and company scoping.

<!-- VERIFY:TEST-DRIVER-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for driver CRUD including
authentication, role authorization, and validation errors.

## Business Rules

- Name is required
- Email must be valid format
- License number is required
- Status defaults to AVAILABLE (enum: AVAILABLE, ON_TRIP, OFF_DUTY)
- All queries scoped by companyId
- Only ADMIN can delete drivers

## Cross-References

- Dispatches using drivers: see [dispatches.md](dispatches.md)
- Authentication: see [authentication.md](authentication.md)
- Data model: see [data-model.md](data-model.md)
