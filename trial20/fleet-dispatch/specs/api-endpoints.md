# API Endpoints Specification

## Overview

Fleet Dispatch exposes a RESTful API via NestJS 11 controllers. All endpoints
except auth and health/metrics require JWT authentication. RBAC enforced via
APP_GUARD chain: ThrottlerGuard, JwtAuthGuard, RolesGuard.

Cross-references: [authentication.md](authentication.md), [security.md](security.md)

## Auth Endpoints

### POST /auth/register
- Public, rate-limited (10/s)
- Body: { email, password, role, tenantId }
- Returns: { access_token, refresh_token }
- Errors: 400 (invalid), 409 (duplicate)

### POST /auth/login
- Public, rate-limited (10/s)
- Body: { email, password }
- Returns: { access_token, refresh_token }
- Errors: 401 (invalid credentials)

### POST /auth/refresh
- Authenticated
- Returns: { access_token, refresh_token }

## Vehicle Endpoints

### GET /vehicles
- Authenticated (any role)
- Query: page, limit (paginated)
- Response: { data: Vehicle[], total, page, limit }
- Headers: Cache-Control: private, max-age=30

### GET /vehicles/:id
- Authenticated (any role)
- Response: Vehicle

### POST /vehicles
- Authenticated (any role)
- Body: CreateVehicleDto

### PUT /vehicles/:id
- Authenticated (any role)
- Body: UpdateVehicleDto

### DELETE /vehicles/:id
- Authenticated, ADMIN only (@Roles('ADMIN'))
- Response: deleted Vehicle

## Route Endpoints (same pattern as Vehicle)

GET /routes, GET /routes/:id, POST /routes, PUT /routes/:id, DELETE /routes/:id
Delete restricted to ADMIN role. Cache-Control on list endpoint.

## Driver Endpoints (same pattern as Vehicle)

GET /drivers, GET /drivers/:id, POST /drivers, PUT /drivers/:id, DELETE /drivers/:id
Delete restricted to ADMIN role.

## Dispatch Endpoints (same pattern as Vehicle)

GET /dispatches, GET /dispatches/:id, POST /dispatches, PUT /dispatches/:id, DELETE /dispatches/:id
Delete restricted to ADMIN role. Includes vehicle/route/driver relations in responses.

## Dashboard & DataSource Endpoints

### GET /dashboards
- Authenticated (any role)
- Returns: [] (placeholder)

### GET /data-sources
- Authenticated (any role)
- Returns: [] (placeholder)

## Health & Metrics Endpoints

### GET /health
- Public (no auth required)
- Response: { status, timestamp, uptime, version }

### GET /health/ready
- Public
- Response: { database: 'connected'|'disconnected', timestamp }

### GET /metrics
- Public
- Response: { requests, errors, averageResponseTime, uptime }

Cross-references: [monitoring.md](monitoring.md), [data-model.md](data-model.md)

## VERIFY Tags

- VERIFY: FD-VEH-003 — Vehicle controller sets Cache-Control headers
- VERIFY: FD-ROUTE-003 — Route controller enforces ADMIN role for deletion
- VERIFY: FD-DRV-003 — Driver controller enforces ADMIN role for deletion
- VERIFY: FD-DISP-003 — Dispatch controller enforces ADMIN role for deletion

## Response Format

All error responses include: statusCode, message, correlationId, timestamp.
Pagination responses include: data, total, page, limit.
