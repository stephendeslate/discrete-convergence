# Dispatches Specification

## Overview

Dispatch assigns a vehicle and driver to a route. Dispatches follow a workflow:
PENDING -> DISPATCHED -> IN_TRANSIT -> COMPLETED or CANCELLED. See
[vehicles.md](vehicles.md), [drivers.md](drivers.md), and [routes.md](routes.md)
for the referenced entities.

## Module Structure

<!-- VERIFY:API-DISPATCH-MODULE -->
The `DispatchModule` registers the dispatch service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-DISPATCH-CONTROLLER -->
The `DispatchController` maps HTTP methods to service operations:
- `GET /dispatches` — List dispatches (paginated, company-scoped)
- `GET /dispatches/:id` — Get dispatch with relations
- `POST /dispatches` — Create dispatch (EDITOR or ADMIN)
- `PATCH /dispatches/:id` — Update dispatch (EDITOR or ADMIN)
- `DELETE /dispatches/:id` — Cancel dispatch (ADMIN only)

<!-- VERIFY:API-DISPATCH-SERVICE -->
The `DispatchService` implements CRUD operations for dispatches with company
scoping. It validates vehicle/driver availability and enforces status
transition rules.

<!-- VERIFY:API-DISPATCH-DTO -->
Dispatch DTOs define validation: vehicleId (required UUID), driverId
(required UUID), routeId (required UUID), scheduledAt (required ISO date),
status (optional enum, defaults to PENDING).

## Test Coverage

<!-- VERIFY:API-DISPATCH-SERVICE-SPEC -->
Unit tests for DispatchService cover creation with availability checks,
status transitions, and company scoping.

## Business Rules

- Vehicle must be ACTIVE to be dispatched
- Driver must be AVAILABLE to be dispatched
- Status transitions: PENDING -> DISPATCHED -> IN_TRANSIT -> COMPLETED
- Cannot transition from COMPLETED back to earlier states
- CANCELLED dispatches cannot be reactivated
- All queries scoped by companyId

## Cross-References

- Vehicles: see [vehicles.md](vehicles.md)
- Drivers: see [drivers.md](drivers.md)
- Routes: see [routes.md](routes.md)
- Trips from dispatches: see [trips.md](trips.md)
