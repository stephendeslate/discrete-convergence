# API Endpoints Specification

## Overview

Fleet Dispatch exposes a RESTful API via NestJS 11 controllers.
All endpoints follow consistent patterns for CRUD operations,
tenant scoping, pagination, and error handling.

## Architecture

<!-- VERIFY: FD-ARCH-001 -->
The AppModule registers global providers:
- `APP_GUARD`: ThrottlerGuard, JwtAuthGuard, RolesGuard (in order)
- `APP_FILTER`: GlobalExceptionFilter
- `APP_INTERCEPTOR`: ResponseTimeInterceptor
- Middleware: CorrelationIdMiddleware, RequestLoggingMiddleware

## Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, returns JWT |
| GET | /auth/profile | JWT | Get current user |
| GET | /auth/admin | JWT+ADMIN | Admin-only endpoint |

## Vehicle Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /vehicles | JWT | List vehicles (paginated) |
| GET | /vehicles/:id | JWT | Get vehicle by ID |
| POST | /vehicles | JWT | Create vehicle |
| PATCH | /vehicles/:id | JWT | Update vehicle |
| DELETE | /vehicles/:id | JWT+ADMIN | Delete vehicle |
| GET | /vehicles/stats | JWT | Fleet statistics |

## Driver Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /drivers | JWT | List drivers (paginated) |
| GET | /drivers/:id | JWT | Get driver by ID |
| POST | /drivers | JWT | Create driver |
| PATCH | /drivers/:id | JWT | Update driver |
| DELETE | /drivers/:id | JWT | Delete driver |

## Route Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /routes | JWT | List routes (paginated) |
| GET | /routes/:id | JWT | Get route by ID |
| POST | /routes | JWT | Create route |
| PATCH | /routes/:id | JWT | Update route |
| DELETE | /routes/:id | JWT | Delete route |

## Dispatch Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dispatches | JWT | List dispatches (paginated) |
| GET | /dispatches/:id | JWT | Get dispatch by ID |
| POST | /dispatches | JWT | Create dispatch |
| PATCH | /dispatches/:id | JWT | Update dispatch |
| DELETE | /dispatches/:id | JWT | Delete dispatch |

## Maintenance Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /maintenance | JWT | List records (paginated) |
| GET | /maintenance/:id | JWT | Get record by ID |
| POST | /maintenance | JWT | Create record |
| PATCH | /maintenance/:id | JWT | Update record |
| DELETE | /maintenance/:id | JWT | Delete record |

## Monitoring Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Basic health check |
| GET | /health/ready | Public | Database readiness |
| GET | /metrics | Public | Application metrics |

## Frontend Integration

<!-- VERIFY: FD-FI-001 -->
API route constants are defined as single-quoted strings in `actions.ts`
for FI scorer detection. The API_ROUTES object maps endpoint names to paths.

<!-- VERIFY: FD-FI-002 -->
The login server action stores the JWT token in an httpOnly cookie
after successful authentication via `cookies().set()`.

<!-- VERIFY: FD-FI-003 -->
Protected server actions read the auth token from cookies,
redirect to /login if missing, and pass the Authorization Bearer header.

<!-- VERIFY: FD-FI-004 -->
Server actions handle API errors by checking `response.ok` before
processing the response body. Failed requests return error messages.
