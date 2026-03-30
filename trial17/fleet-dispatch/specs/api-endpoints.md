# API Endpoints Specification

## Overview

Fleet Dispatch exposes RESTful CRUD endpoints for four domain entities:
Vehicle, Driver, Dispatch, and Route. All endpoints (except auth and monitoring)
require JWT authentication and enforce tenant isolation by extracting `tenantId`
from the JWT payload.

## Vehicle Endpoints

<!-- VERIFY: FD-VEH-001 -->
The `VehicleService` implements full CRUD operations:
- `create(data, tenantId)`: Creates a vehicle scoped to the tenant
- `findAll(tenantId, pagination)`: Returns paginated vehicles for the tenant
- `findOne(id, tenantId)`: Returns a single vehicle, verifying tenant ownership
- `update(id, data, tenantId)`: Updates vehicle fields with tenant check
- `remove(id, tenantId)`: Deletes a vehicle with tenant verification

All queries include `where: { tenantId }` to enforce tenant isolation at the
application layer, complementing the database-level RLS policies.

<!-- VERIFY: FD-VEH-002 -->
The `VehicleController` maps HTTP methods to service operations:
- `GET /vehicles` — List vehicles (paginated)
- `GET /vehicles/:id` — Get single vehicle
- `POST /vehicles` — Create vehicle (admin, dispatcher)
- `PATCH /vehicles/:id` — Update vehicle (admin, dispatcher)
- `DELETE /vehicles/:id` — Delete vehicle (admin only)

The controller extracts `tenantId` from `@Req()` user payload and passes it
to every service method. Role restrictions use `@Roles()` decorator.

## Driver Endpoints

<!-- VERIFY: FD-DRV-001 -->
The `DriverService` implements CRUD with the same tenant isolation pattern as
vehicles. Driver records include license information, status tracking, and
contact details. The `findAll` method supports pagination via `parsePagination()`
from the shared package.

<!-- VERIFY: FD-DRV-002 -->
The `DriverController` exposes:
- `GET /drivers` — List drivers (paginated)
- `GET /drivers/:id` — Get single driver
- `POST /drivers` — Create driver (admin, dispatcher)
- `PATCH /drivers/:id` — Update driver (admin, dispatcher)
- `DELETE /drivers/:id` — Delete driver (admin only)

## Dispatch Endpoints

<!-- VERIFY: FD-DISP-001 -->
The `DispatchService` manages dispatch lifecycle including assignment of vehicles,
drivers, and routes. It uses Prisma `include` directives to eagerly load related
entities (vehicle, driver, route) preventing N+1 query issues. Status transitions
follow the DispatchStatus enum: pending → in_progress → completed | cancelled.

<!-- VERIFY: FD-DISP-002 -->
The `DispatchController` exposes:
- `GET /dispatches` — List dispatches with related entities (paginated)
- `GET /dispatches/:id` — Get dispatch with full details
- `POST /dispatches` — Create dispatch (admin, dispatcher)
- `PATCH /dispatches/:id` — Update dispatch (admin, dispatcher)
- `DELETE /dispatches/:id` — Delete dispatch (admin only)

## Route Endpoints

<!-- VERIFY: FD-ROUTE-001 -->
The `RouteService` manages route definitions including origin, destination,
distance, and estimated duration. Routes can be associated with dispatches.
The service follows the same tenant-scoped CRUD pattern as other domain services.

<!-- VERIFY: FD-ROUTE-002 -->
The `RouteController` exposes:
- `GET /routes` — List routes (paginated)
- `GET /routes/:id` — Get single route
- `POST /routes` — Create route (admin, dispatcher)
- `PATCH /routes/:id` — Update route (admin, dispatcher)
- `DELETE /routes/:id` — Delete route (admin only)

## Frontend Integration Tags

<!-- VERIFY: FD-VEH-003 -->
The web application's server actions module provides `fetchVehicles()`,
`createVehicle()`, `updateVehicle()`, and `deleteVehicle()` functions that
call the API endpoints with authenticated fetch using the stored JWT token.

<!-- VERIFY: FD-DRV-003 -->
The web application's server actions provide `fetchDrivers()`, `createDriver()`,
`updateDriver()`, and `deleteDriver()` functions following the same pattern.

<!-- VERIFY: FD-DISP-003 -->
The web application's server actions provide `fetchDispatches()`,
`createDispatch()`, `updateDispatch()`, and `deleteDispatch()` functions.

<!-- VERIFY: FD-ROUTE-003 -->
The web application's server actions provide `fetchRoutes()`, `createRoute()`,
`updateRoute()`, and `deleteRoute()` functions.

## Cross-References

- Authentication required for all endpoints: see [authentication.md](authentication.md)
- Role-based access control: see [security.md](security.md) (FD-SEC-002, FD-SEC-003)
- Pagination clamping: see [cross-layer.md](cross-layer.md) (FD-PERF-001)
- Request validation: see [infrastructure.md](infrastructure.md) (FD-INFRA-001)

## DTO Validation

All DTOs use `class-validator` decorators:
- `@IsString()` with `@MaxLength()` on all string fields
- `@IsUUID()` or `@MaxLength(36)` on ID reference fields
- `@IsEnum()` for status fields
- `@IsOptional()` on update DTOs for partial updates
- `@IsNumber()` with `@IsPositive()` on numeric fields
