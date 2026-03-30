# API Endpoints Specification

## Overview

The Fleet Dispatch API is a NestJS 11 REST API serving all domain operations.
All domain endpoints require JWT authentication. Health endpoints are publicly accessible.
All list endpoints support pagination via page and pageSize query parameters.

## Auth Endpoints (Public)

### POST /auth/register
- Body: { email, password, tenantId, role? }
- Response: { accessToken, refreshToken }
- Rate limited: 10 requests per minute

### POST /auth/login
- Body: { email, password }
- Response: { accessToken, refreshToken }
- Rate limited: @Throttle({ short: { ttl: 1000, limit: 10 } })

### POST /auth/refresh
- Body: { refreshToken }
- Response: { accessToken, refreshToken }

## Vehicle Endpoints (Authenticated)

- GET /vehicles — List vehicles (paginated)
- POST /vehicles — Create vehicle
- GET /vehicles/:id — Get vehicle by ID
- PUT /vehicles/:id — Update vehicle
- DELETE /vehicles/:id — Delete vehicle
- PATCH /vehicles/:id/activate — Activate vehicle (status branching)
- PATCH /vehicles/:id/deactivate — Deactivate vehicle (active dispatch check)

## Driver Endpoints (Authenticated)

- GET /drivers — List drivers (paginated)
- POST /drivers — Create driver
- GET /drivers/:id — Get driver by ID
- PUT /drivers/:id — Update driver
- DELETE /drivers/:id — Delete driver (ON_DUTY check, active dispatch check)
- PATCH /drivers/:id/status — Update driver status (branching logic)

## Route Endpoints (Authenticated)

- GET /routes — List routes (paginated)
- POST /routes — Create route
- GET /routes/:id — Get route by ID
- PUT /routes/:id — Update route
- DELETE /routes/:id — Delete route

## Dispatch Endpoints (Authenticated)

- GET /dispatches — List dispatches (paginated, includes vehicle/driver/route)
- POST /dispatches — Create dispatch (vehicle/driver/route validation)
- GET /dispatches/:id — Get dispatch by ID
- PATCH /dispatches/:id/assign — Assign dispatch (PENDING -> ASSIGNED)
- PATCH /dispatches/:id/complete — Complete dispatch (ASSIGNED -> COMPLETED)
- PATCH /dispatches/:id/cancel — Cancel dispatch (state validation)

## Maintenance Endpoints (Authenticated)

- GET /maintenance — List maintenance records (paginated)
- POST /maintenance — Create maintenance (vehicle validation, emergency status)
- GET /maintenance/:id — Get maintenance by ID
- PUT /maintenance/:id — Update maintenance (completed/cancelled check)
- PATCH /maintenance/:id/complete — Complete maintenance (vehicle status restore)

## Trip Endpoints (Authenticated)

- GET /trips — List trips (paginated)
- POST /trips — Create trip (dispatch status validation)
- GET /trips/:id — Get trip by ID
- PATCH /trips/:id/complete — Complete trip (distance recording)

## Zone Endpoints (Authenticated)

- GET /zones — List zones (paginated)
- POST /zones — Create zone
- GET /zones/:id — Get zone by ID
- PUT /zones/:id — Update zone
- DELETE /zones/:id — Delete zone

## Monitoring Endpoints (Public)

- GET /health — Liveness check, returns { status: 'ok' }
- GET /health/ready — Readiness check with database connectivity
- GET /health/metrics — System metrics (uptime, memory, connections)

## Pagination

All list endpoints accept:
- page: number (default 1, min 1)
- pageSize: number (default 20, max 100)

Response format:
- data: T[] — array of items
- meta: { page, pageSize, total, totalPages }
