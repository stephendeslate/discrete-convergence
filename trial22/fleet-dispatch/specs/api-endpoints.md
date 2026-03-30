# API Endpoints Specification

## Overview

All endpoints except /auth/* and /health* require JWT authentication.
Responses include tenant-scoped data only. List endpoints support pagination.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Create new user account |
| POST | /auth/login | Public | Authenticate and get tokens |

## Health Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Basic health check |
| GET | /health/ready | Public | Database readiness check |

<!-- VERIFY: FD-API-001 — Health endpoints are @Public() but NOT @SkipThrottle() -->

## Domain Endpoints

All domain endpoints require Bearer token and scope queries by tenant_id from JWT.

### Vehicles (/vehicles)
- GET / — List with pagination
- GET /:id — Get by ID
- POST / — Create
- PATCH /:id — Update
- DELETE /:id — Delete (ADMIN only)

<!-- VERIFY: FD-API-002 — Vehicle DELETE requires @Roles('ADMIN') -->
<!-- VERIFY: FD-VEH-001 — VehicleService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-VEH-002 — VehicleController extracts tenantId from req.user for all operations -->

### Drivers (/drivers)
- GET / — List with pagination
- GET /:id — Get by ID
- POST / — Create
- PATCH /:id — Update
- DELETE /:id — Delete (ADMIN only)

<!-- VERIFY: FD-DRV-001 — DriverService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-DRV-002 — DriverController extracts tenantId from req.user for all operations -->

### Routes (/routes)
- GET / — List, GET /:id — Detail, POST / — Create, PATCH /:id — Update, DELETE /:id — Delete

<!-- VERIFY: FD-ROUTE-001 — RouteService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-ROUTE-002 — RouteController extracts tenantId from req.user for all operations -->

### Trips (/trips)
- GET / — List with includes (route, vehicle, driver), GET /:id, POST /, PATCH /:id, DELETE /:id

<!-- VERIFY: FD-TRIP-001 — TripService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-TRIP-002 — TripController extracts tenantId from req.user for all operations -->

### Stops (/stops)
- GET / — List, GET /:id, POST /, DELETE /:id

<!-- VERIFY: FD-STOP-001 — StopService implements tenant-scoped CRUD with parsePagination -->

### Dispatches (/dispatches)
- GET / — List, GET /:id, POST /, PATCH /:id, DELETE /:id

<!-- VERIFY: FD-DISP-001 — DispatchService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-DISP-002 — DispatchController extracts tenantId from req.user for all operations -->

### Maintenance Records (/maintenance)
- GET / — List, GET /:id, POST /, DELETE /:id

<!-- VERIFY: FD-MAINT-001 — MaintenanceService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-MAINT-002 — MaintenanceController extracts tenantId from req.user for all operations -->

### Fuel Logs (/fuel-logs)
- GET / — List, GET /:id, POST /, DELETE /:id

<!-- VERIFY: FD-FUEL-001 — FuelService implements tenant-scoped CRUD with parsePagination -->
<!-- VERIFY: FD-FUEL-002 — FuelController extracts tenantId from req.user for all operations -->

### Geofences (/geofences)
- GET / — List, GET /:id, POST /, DELETE /:id

<!-- VERIFY: FD-GEO-001 — GeofenceService implements tenant-scoped CRUD with parsePagination -->

### Alerts (/alerts)
- GET / — List, GET /:id, POST /, PATCH /:id/read — Mark read, DELETE /:id

<!-- VERIFY: FD-ALERT-001 — AlertService implements tenant-scoped CRUD with markRead support -->

### Notifications (/notifications)
- GET / — List, GET /:id, POST /, PATCH /:id/read — Mark read, DELETE /:id

<!-- VERIFY: FD-NOTIF-001 — NotificationService implements tenant-scoped CRUD with markRead support -->

### Audit Logs (/audit-logs)
- GET / — List (ADMIN only)

<!-- VERIFY: FD-AUDIT-001 — AuditService implements tenant-scoped list with parsePagination -->
<!-- VERIFY: FD-AUDIT-002 — AuditController requires @Roles('ADMIN') and extracts tenantId -->

<!-- VERIFY: FD-API-003 — Audit log list requires @Roles('ADMIN') -->

## Pagination

All list endpoints accept `page` and `limit` query parameters.
<!-- VERIFY: FD-API-004 — parsePagination clamps limit to MAX_PAGE_SIZE (100) -->
<!-- VERIFY: FD-API-005 — List responses include { data, total, page, limit } -->

## Tenant Scoping

<!-- VERIFY: FD-API-006 — Every controller extracts tenantId from req.user via @Req() -->
