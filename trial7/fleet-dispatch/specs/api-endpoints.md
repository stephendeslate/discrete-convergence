# API Endpoints Specification

## Overview

Fleet Dispatch exposes a RESTful API via NestJS controllers. All endpoints
require JWT authentication except those marked @Public(). Data is filtered
by tenantId from JWT context. See [data-model.md](data-model.md) for entity schemas.

## Vehicle Endpoints

- VERIFY: FD-VEH-001 — CreateVehicleDto validates tenantId, licensePlate, make, model, year, mileage, fuelCostPerKm
- VERIFY: FD-VEH-002 — UpdateVehicleDto allows partial updates with status validation
- VERIFY: FD-VEH-003 — VehicleService implements CRUD with tenant isolation and pagination
- VERIFY: FD-VEH-004 — VehicleController routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

### Vehicle Routes
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | /vehicles | JWT | ADMIN, DISPATCHER |
| GET | /vehicles | JWT | Any |
| GET | /vehicles/:id | JWT | Any |
| PATCH | /vehicles/:id | JWT | ADMIN, DISPATCHER |
| DELETE | /vehicles/:id | JWT | ADMIN |

## Driver Endpoints

- VERIFY: FD-DRV-001 — CreateDriverDto validates tenantId, name, licenseNumber, phone
- VERIFY: FD-DRV-002 — UpdateDriverDto allows partial updates with status validation
- VERIFY: FD-DRV-003 — DriverService implements CRUD with tenant isolation and pagination
- VERIFY: FD-DRV-004 — DriverController routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

### Driver Routes
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | /drivers | JWT | ADMIN, DISPATCHER |
| GET | /drivers | JWT | Any |
| GET | /drivers/:id | JWT | Any |
| PATCH | /drivers/:id | JWT | ADMIN, DISPATCHER |
| DELETE | /drivers/:id | JWT | ADMIN |

## Route Endpoints

- VERIFY: FD-RTE-001 — CreateRouteDto validates tenantId, name, origin, destination, distanceKm
- VERIFY: FD-RTE-002 — UpdateRouteDto allows partial updates with status validation
- VERIFY: FD-RTE-003 — RouteService implements CRUD with tenant isolation and pagination
- VERIFY: FD-RTE-004 — RouteController routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

## Dispatch Endpoints

- VERIFY: FD-DSP-001 — CreateDispatchDto validates tenantId, vehicleId, driverId, routeId, scheduledAt
- VERIFY: FD-DSP-002 — UpdateDispatchDto allows status and notes updates
- VERIFY: FD-DSP-003 — DispatchService implements CRUD with N+1 prevention via include
- VERIFY: FD-DSP-004 — DispatchController routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

## Maintenance Endpoints

- VERIFY: FD-MNT-001 — CreateMaintenanceDto validates tenantId, vehicleId, type, description, cost, performedAt
- VERIFY: FD-MNT-002 — UpdateMaintenanceDto allows partial updates for maintenance records
- VERIFY: FD-MNT-003 — MaintenanceService implements CRUD with vehicle include
- VERIFY: FD-MNT-004 — MaintenanceController routes: POST, GET, GET/:id, PATCH/:id, DELETE/:id

## Audit Log Endpoints

- VERIFY: FD-AUD-001 — CreateAuditLogDto validates tenantId, userId, action, entity, entityId
- VERIFY: FD-AUD-002 — AuditService implements create and findAll with user include
- VERIFY: FD-AUD-003 — AuditController exposes POST and GET (ADMIN-only list)

## Common Patterns

- All list endpoints support pagination via page and pageSize query params
- Page size is clamped to MAX_PAGE_SIZE (100), not rejected
- All list endpoints return { data, total, page, pageSize }
- Cache-Control headers set on all list endpoints
