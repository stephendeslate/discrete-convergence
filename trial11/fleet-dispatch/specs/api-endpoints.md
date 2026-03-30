# API Endpoints Specification

## Overview

Fleet Dispatch exposes a RESTful API built with NestJS. All domain endpoints
require JWT authentication via the global JwtAuthGuard (APP_GUARD). Public
endpoints are exempted with the @Public() decorator.

## Authentication Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /auth/register | Register new user | Public |
| POST | /auth/login | Login and get JWT | Public |

## Vehicle Endpoints

- VERIFY: FD-API-001 — Vehicle CRUD: Create, Read, ReadAll, Update, Delete
- VERIFY: FD-API-002 — Vehicle endpoints scoped by tenantId from JWT

| Method | Path | Description |
|--------|------|-------------|
| POST | /vehicles | Create vehicle |
| GET | /vehicles | List vehicles (paginated) |
| GET | /vehicles/:id | Get vehicle by ID |
| PATCH | /vehicles/:id | Update vehicle |
| DELETE | /vehicles/:id | Delete vehicle |

## Driver Endpoints

- VERIFY: FD-API-003 — Driver CRUD: Create, Read, ReadAll, Update, Delete
- VERIFY: FD-API-004 — Driver endpoints scoped by tenantId from JWT

| Method | Path | Description |
|--------|------|-------------|
| POST | /drivers | Create driver |
| GET | /drivers | List drivers (paginated) |
| GET | /drivers/:id | Get driver by ID |
| PATCH | /drivers/:id | Update driver |
| DELETE | /drivers/:id | Delete driver |

## Dispatch Endpoints

- VERIFY: FD-API-005 — Dispatch CRUD: Create, Read, ReadAll, Update, Delete
- VERIFY: FD-API-006 — Dispatch endpoints scoped by tenantId from JWT

| Method | Path | Description |
|--------|------|-------------|
| POST | /dispatches | Create dispatch |
| GET | /dispatches | List dispatches (paginated) |
| GET | /dispatches/:id | Get dispatch by ID |
| PATCH | /dispatches/:id | Update dispatch |
| DELETE | /dispatches/:id | Delete dispatch |

## Pagination

All list endpoints support pagination with query parameters.
See [Monitoring Specification](monitoring.md) for correlation ID propagation.

- VERIFY: FD-PERF-001 — MAX_PAGE_SIZE=100 from shared constants
- VERIFY: FD-PERF-002 — DEFAULT_PAGE_SIZE=20 from shared constants
- VERIFY: FD-PERF-003 — Pagination parameters: page, pageSize, skip, take
- VERIFY: FD-PERF-004 — Pagination clamping (not rejection) for out-of-range values

## Response Headers

- VERIFY: FD-PERF-005 — X-Response-Time header on all responses via ResponseTimeInterceptor
- VERIFY: FD-PERF-006 — Cache-Control headers on all list endpoints

## Validation

- VERIFY: FD-API-007 — All DTO string fields: @IsString() + @MaxLength()
- VERIFY: FD-API-008 — All DTO UUID fields: @MaxLength(36)
- VERIFY: FD-API-009 — Email fields: @IsEmail() + @IsString() + @MaxLength()
- VERIFY: FD-API-010 — ValidationPipe with whitelist + forbidNonWhitelisted + transform

## Error Responses

All error responses follow a consistent format with correlationId:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "correlationId": "uuid-string"
}
```

## Admin-Only Endpoints

- VERIFY: FD-API-011 — DELETE /vehicles/:id requires @Roles('ADMIN')
- VERIFY: FD-API-012 — DELETE /drivers/:id requires @Roles('ADMIN')
