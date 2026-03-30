# Fleet Dispatch — Build Plan

## Domain Research

Multi-tenant field service dispatch platform. Companies manage vehicles, drivers, routes, dispatches, trips, maintenance, and zones.

### Entities
- **Company**: Tenant container. All domain entities scoped by `companyId`.
- **User**: Authenticated user. Roles: ADMIN, DISPATCHER, DRIVER.
- **Vehicle**: Fleet vehicle. Status: AVAILABLE, IN_USE, MAINTENANCE, RETIRED.
- **Driver**: Field technician/driver. Status: AVAILABLE, ON_ROUTE, OFF_DUTY.
- **Route**: Planned route with waypoints. Status: PLANNED, ACTIVE, COMPLETED, CANCELLED.
- **Dispatch**: Assignment of driver+vehicle to route. Status: PENDING, DISPATCHED, IN_PROGRESS, COMPLETED, CANCELLED.
- **Trip**: Individual trip segment. Status: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED.
- **Maintenance**: Vehicle maintenance record. Status: SCHEDULED, IN_PROGRESS, COMPLETED.
- **Zone**: Geographic service zone with boundaries.

### Relationships
- Company 1→N Users, Vehicles, Drivers, Routes, Zones
- Route 1→N Dispatches, Trips
- Dispatch N→1 Driver, Vehicle
- Trip N→1 Route, Driver, Vehicle
- Maintenance N→1 Vehicle

### Constraints
- Vehicle cannot be dispatched during maintenance
- Driver can only be on one active route at a time
- Dispatch requires available driver + available vehicle
- Trip completion updates driver/vehicle status
- Deactivated vehicles cannot be assigned

## Data Model

### Prisma Models

| Model | Fields | Constraints |
|-------|--------|-------------|
| Company | id, name, slug, plan, createdAt, updatedAt | @@map("companies") |
| User | id, companyId, email, passwordHash, name, role, createdAt, updatedAt | @@map("users"), @@index([companyId]), unique email |
| Vehicle | id, companyId, make, model, year, licensePlate, vin, status, mileage, createdAt, updatedAt | @@map("vehicles"), @@index([companyId]), @@index([companyId, status]) |
| Driver | id, companyId, userId?, name, email, phone, licenseNumber, status, createdAt, updatedAt | @@map("drivers"), @@index([companyId]), @@index([companyId, status]) |
| Route | id, companyId, name, description, startLocation, endLocation, distance, estimatedDuration, status, createdAt, updatedAt | @@map("routes"), @@index([companyId]), @@index([companyId, status]) |
| Dispatch | id, companyId, routeId, driverId, vehicleId, status, scheduledAt, startedAt, completedAt, notes, createdAt, updatedAt | @@map("dispatches"), @@index([companyId]), @@index([routeId]), @@index([driverId]), @@index([vehicleId]) |
| Trip | id, companyId, routeId, driverId, vehicleId, startLocation, endLocation, startTime, endTime, distance, status, createdAt, updatedAt | @@map("trips"), @@index([companyId]), @@index([routeId]) |
| Maintenance | id, companyId, vehicleId, type, description, cost, scheduledDate, completedDate, status, createdAt, updatedAt | @@map("maintenances"), @@index([companyId]), @@index([vehicleId]) |
| Zone | id, companyId, name, description, boundaries, isActive, createdAt, updatedAt | @@map("zones"), @@index([companyId]) |

### Enums
- Role: ADMIN, DISPATCHER, DRIVER (each @map)
- VehicleStatus: AVAILABLE, IN_USE, MAINTENANCE, RETIRED (each @map)
- DriverStatus: AVAILABLE, ON_ROUTE, OFF_DUTY (each @map)
- RouteStatus: PLANNED, ACTIVE, COMPLETED, CANCELLED (each @map)
- DispatchStatus: PENDING, DISPATCHED, IN_PROGRESS, COMPLETED, CANCELLED (each @map)
- TripStatus: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED (each @map)
- MaintenanceStatus: SCHEDULED, IN_PROGRESS, COMPLETED (each @map)

### RLS Plan
Tables: users, vehicles, drivers, routes, dispatches, trips, maintenances, zones
Each: ENABLE + FORCE + CREATE POLICY

## Endpoint Manifest

| Method | Path | Auth | Controller | Service Method |
|--------|------|------|------------|----------------|
| POST | /auth/register | Public | AuthController | register() |
| POST | /auth/login | Public | AuthController | login() |
| GET | /auth/profile | JWT | AuthController | getProfile() |
| GET | /vehicles | JWT | VehicleController | findAll() |
| POST | /vehicles | JWT | VehicleController | create() |
| GET | /vehicles/:id | JWT | VehicleController | findOne() |
| PATCH | /vehicles/:id | JWT | VehicleController | update() |
| DELETE | /vehicles/:id | JWT | VehicleController | remove() |
| POST | /vehicles/:id/activate | JWT | VehicleController | activate() |
| POST | /vehicles/:id/deactivate | JWT | VehicleController | deactivate() |
| GET | /drivers | JWT | DriverController | findAll() |
| POST | /drivers | JWT | DriverController | create() |
| GET | /drivers/:id | JWT | DriverController | findOne() |
| PATCH | /drivers/:id | JWT | DriverController | update() |
| GET | /routes | JWT | RouteController | findAll() |
| POST | /routes | JWT | RouteController | create() |
| GET | /routes/:id | JWT | RouteController | findOne() |
| PATCH | /routes/:id | JWT | RouteController | update() |
| GET | /dispatches | JWT | DispatchController | findAll() |
| POST | /dispatches | JWT | DispatchController | create() |
| GET | /dispatches/:id | JWT | DispatchController | findOne() |
| POST | /dispatches/:id/dispatch | JWT | DispatchController | dispatch() |
| POST | /dispatches/:id/complete | JWT | DispatchController | complete() |
| POST | /dispatches/:id/cancel | JWT | DispatchController | cancel() |
| GET | /trips | JWT | TripController | findAll() |
| POST | /trips | JWT | TripController | create() |
| GET | /trips/:id | JWT | TripController | findOne() |
| POST | /trips/:id/complete | JWT | TripController | complete() |
| GET | /maintenance | JWT | MaintenanceController | findAll() |
| POST | /maintenance | JWT | MaintenanceController | create() |
| PATCH | /maintenance/:id | JWT | MaintenanceController | update() |
| GET | /zones | JWT | ZoneController | findAll() |
| POST | /zones | JWT | ZoneController | create() |
| PATCH | /zones/:id | JWT | ZoneController | update() |
| POST | /zones/:id/activate | JWT | ZoneController | activate() |
| POST | /zones/:id/deactivate | JWT | ZoneController | deactivate() |
| GET | /dashboards | JWT | DashboardController | getData() |
| GET | /data-sources | JWT | DataSourceController | findAll() |
| GET | /metrics | JWT | MonitoringController | getMetrics() |
| GET | /health | Public | HealthController | check() |
| GET | /health/ready | Public | HealthController | ready() |

## Service Logic

### VehicleService
```
activate(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status === AVAILABLE → BadRequestException('Vehicle already active')
  - If status === RETIRED → BadRequestException('Cannot activate retired vehicle')
  - Update status=AVAILABLE
  - Return updated

deactivate(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status === RETIRED → BadRequestException('Vehicle already deactivated')
  - If status === IN_USE → BadRequestException('Cannot deactivate vehicle in use')
  - Update status=RETIRED
  - Return updated
```

### DispatchService
```
dispatch(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status !== PENDING → BadRequestException('Only pending dispatches can be dispatched')
  - Check driver status=AVAILABLE → BadRequestException('Driver not available')
  - Check vehicle status=AVAILABLE → BadRequestException('Vehicle not available')
  - Update dispatch status=DISPATCHED, driver to ON_ROUTE, vehicle to IN_USE
  - Return updated

complete(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status !== IN_PROGRESS && status !== DISPATCHED → BadRequestException
  - Update dispatch status=COMPLETED, completedAt=now
  - Update driver to AVAILABLE, vehicle to AVAILABLE
  - Return updated

cancel(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status === COMPLETED → BadRequestException('Cannot cancel completed dispatch')
  - If status === CANCELLED → BadRequestException('Already cancelled')
  - Update status=CANCELLED
  - If was active: reset driver/vehicle to AVAILABLE
  - Return updated
```

### TripService
```
complete(id, companyId):
  - Find by id + companyId → NotFoundException
  - If status !== IN_PROGRESS → BadRequestException('Only in-progress trips can be completed')
  - Update status=COMPLETED, endTime=now
  - Return updated
```

### ZoneService
```
activate(id, companyId):
  - Find by id + companyId → NotFoundException
  - If isActive → BadRequestException('Zone already active')
  - Update isActive=true
  - Return updated

deactivate(id, companyId):
  - Find by id + companyId → NotFoundException
  - If !isActive → BadRequestException('Zone already inactive')
  - Update isActive=false
  - Return updated
```

## Edge Cases

| Endpoint | Error Case | Response | VERIFY Tag |
|----------|-----------|----------|------------|
| POST /auth/register | Duplicate email | 409 Conflict | FD-EDGE-001 |
| POST /auth/login | Wrong password | 401 Unauthorized | FD-EDGE-002 |
| POST /dispatches/:id/dispatch | Driver not available | 400 BadRequest | FD-EDGE-003 |
| POST /dispatches/:id/dispatch | Vehicle not available | 400 BadRequest | FD-EDGE-004 |
| POST /vehicles/:id/deactivate | Vehicle in use | 400 BadRequest | FD-EDGE-005 |
| POST /vehicles/:id/activate | Already active | 400 BadRequest | FD-EDGE-006 |
| POST /dispatches/:id/complete | Not in progress | 400 BadRequest | FD-EDGE-007 |
| POST /dispatches/:id/cancel | Already completed | 400 BadRequest | FD-EDGE-008 |
| GET /vehicles/:id | Not found | 404 NotFound | FD-EDGE-009 |
| GET /vehicles/:id | Wrong tenant | 404 NotFound | FD-EDGE-010 |
| POST /trips/:id/complete | Not in progress | 400 BadRequest | FD-EDGE-011 |
| POST /maintenance | Vehicle in maintenance | 409 Conflict | FD-EDGE-012 |

## Spec Outline

```
specs/authentication.md (5 tags):
  FD-AUTH-001 through FD-AUTH-005

specs/data-model.md (5 tags):
  FD-DATA-001 through FD-DATA-005

specs/api-endpoints.md (6 tags):
  FD-API-001 through FD-API-006

specs/frontend.md (4 tags):
  FD-FE-001 through FD-FE-004

specs/infrastructure.md (4 tags):
  FD-INFRA-001 through FD-INFRA-004

specs/security.md (5 tags):
  FD-SEC-001 through FD-SEC-005

specs/monitoring.md (4 tags):
  FD-MON-001 through FD-MON-004

specs/edge-cases.md (12 tags):
  FD-EDGE-001 through FD-EDGE-012

Total VERIFY tags: 45
```

## Frontend Routes & Actions

| Route | Page File | Server Actions | Forms |
|-------|-----------|---------------|-------|
| /login | app/login/page.tsx | loginAction | LoginForm |
| /register | app/register/page.tsx | registerAction | RegisterForm |
| /dashboard | app/dashboard/page.tsx | getFleetStats | — |
| /vehicles | app/vehicles/page.tsx | getVehicles, createVehicle | CreateVehicleForm |
| /drivers | app/drivers/page.tsx | getDrivers, createDriver | CreateDriverForm |
| /dispatches | app/dispatches/page.tsx | getDispatches, createDispatch, dispatchAction | CreateDispatchForm |
| /routes | app/routes/page.tsx | getRoutes, createRoute | — |
| /data-sources | app/data-sources/page.tsx | getDataSources | — |
| /settings | app/settings/page.tsx | updateProfile | SettingsForm |

### UI Ceiling Alignment
- C8: Domain routes: /vehicles, /drivers, /dispatches, /routes (4 ✓)
- C9: Write actions: createVehicle (POST), createDriver (POST), createDispatch (POST), dispatchAction (POST) (4 ✓)
- C10: Forms: CreateVehicleForm, CreateDriverForm, CreateDispatchForm (3 ✓)

## Plan Validation
- [x] Every model with >= 2 fields has service: Vehicle, Driver, Route, Dispatch, Trip, Maintenance, Zone (7/7)
- [x] >= 35 VERIFY tags: 45
- [x] >= 10 edge-case tags: 12
- [x] >= 3 domain routes, 3 write actions, 2 forms
- [x] RLS complete
