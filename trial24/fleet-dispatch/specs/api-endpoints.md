# API Endpoints Specification

## Overview

The Fleet Dispatch API exposes REST endpoints via NestJS controllers. All
endpoints except health checks and auth require JWT authentication. Responses
include correlation IDs and response time headers.

## Endpoint Summary

### Authentication (no auth for register/login)
- `POST /auth/register` — Register new user (default VIEWER role)
- `POST /auth/login` — Login, returns access + refresh tokens
- `POST /auth/refresh` — Refresh access token (requires JWT)

### Vehicles (auth required)
- `GET /vehicles` — List vehicles (paginated, company-scoped)
- `GET /vehicles/:id` — Get vehicle by ID
- `POST /vehicles` — Create vehicle (EDITOR+)
- `PATCH /vehicles/:id` — Update vehicle (EDITOR+)
- `DELETE /vehicles/:id` — Delete vehicle (ADMIN)

### Drivers (auth required)
- `GET /drivers` — List drivers (paginated, company-scoped)
- `GET /drivers/:id` — Get driver by ID
- `POST /drivers` — Create driver (EDITOR+)
- `PATCH /drivers/:id` — Update driver (EDITOR+)
- `DELETE /drivers/:id` — Delete driver (ADMIN)

### Routes (auth required)
- `GET /routes` — List routes (paginated, company-scoped)
- `GET /routes/:id` — Get route by ID
- `POST /routes` — Create route (EDITOR+)
- `PATCH /routes/:id` — Update route (EDITOR+)
- `DELETE /routes/:id` — Delete route (ADMIN)

### Dispatches (auth required)
- `GET /dispatches` — List dispatches (paginated, company-scoped)
- `GET /dispatches/:id` — Get dispatch with relations
- `POST /dispatches` — Create dispatch (EDITOR+)
- `PATCH /dispatches/:id` — Update dispatch (EDITOR+)
- `DELETE /dispatches/:id` — Cancel dispatch (ADMIN)

### Trips (auth required)
- `GET /trips` — List trips (paginated, company-scoped)
- `GET /trips/:id` — Get trip with dispatch
- `POST /trips` — Create trip (EDITOR+)
- `PATCH /trips/:id` — Update trip (EDITOR+)

### Maintenance (auth required)
- `GET /maintenance` — List records (paginated, company-scoped)
- `GET /maintenance/:id` — Get record with vehicle
- `POST /maintenance` — Create record (EDITOR+)
- `PATCH /maintenance/:id` — Update record (EDITOR+)
- `DELETE /maintenance/:id` — Delete record (ADMIN)

### Zones (auth required)
- `GET /zones` — List zones (paginated, company-scoped)
- `GET /zones/:id` — Get zone by ID
- `POST /zones` — Create zone (EDITOR+)
- `PATCH /zones/:id` — Update zone (EDITOR+)
- `DELETE /zones/:id` — Delete zone (ADMIN)

### Monitoring (no auth)
- `GET /health` — Liveness probe
- `GET /health/ready` — Readiness probe with DB check

## Request/Response Conventions

- All list endpoints support `page` and `pageSize` query parameters
- UUID path parameters validated via ParseUUIDPipe
- Error responses: { statusCode, message, error, timestamp, correlationId }
- Paginated responses: { data, total, page, pageSize }

## Cross-References

- Authentication: see [authentication.md](authentication.md)
- Vehicle endpoints: see [vehicles.md](vehicles.md)
- Driver endpoints: see [drivers.md](drivers.md)
- Health endpoints: see [monitoring.md](monitoring.md)
