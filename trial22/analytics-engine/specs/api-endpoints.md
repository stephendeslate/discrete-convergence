# API Endpoints Specification

## Overview

The Analytics Engine API follows RESTful conventions with NestJS 11.
All endpoints require JWT authentication unless marked @Public().
Responses include correlation IDs and standard error formats.

## Auth Endpoints

- POST /auth/register — Create new user account
- POST /auth/login — Authenticate and receive tokens
- POST /auth/refresh — Exchange refresh token for new access token

All auth endpoints are @Public() and rate-limited with @Throttle.

VERIFY: AE-AUTH-004 — Rate limiting on auth endpoints with @Throttle decorator

## Dashboard Endpoints

- GET /dashboards — List dashboards (paginated, CacheControlInterceptor)
- GET /dashboards/:id — Get single dashboard by ID
- POST /dashboards — Create new dashboard
- PUT /dashboards/:id — Update dashboard
- DELETE /dashboards/:id — Delete dashboard (@Roles('ADMIN'))

VERIFY: AE-DASH-001 — Dashboard service uses tenant scoping on all operations
VERIFY: AE-DASH-002 — Dashboard controller delegates to service layer
VERIFY: AE-SEC-009 — @Roles('ADMIN') required for dashboard deletion

## Widget Endpoints

- GET /widgets — List widgets (paginated, CacheControlInterceptor)
- GET /widgets/:id — Get single widget
- POST /widgets — Create widget
- PUT /widgets/:id — Update widget
- DELETE /widgets/:id — Delete widget

VERIFY: AE-WIDGET-001 — Widget service uses tenant scoping
VERIFY: AE-WIDGET-002 — Widget controller delegates to service

## Data Source Endpoints

- GET /data-sources — List data sources (paginated, CacheControlInterceptor)
- GET /data-sources/:id — Get single data source
- POST /data-sources — Create data source
- PUT /data-sources/:id — Update data source
- DELETE /data-sources/:id — Delete data source (@Roles('ADMIN'))

VERIFY: AE-DS-001 — DataSource service uses tenant scoping
VERIFY: AE-DS-002 — DataSource controller delegates to service

## Monitoring Endpoints

- GET /health — Health check (status, uptime, version)
- GET /health/ready — Readiness probe (database connectivity)
- GET /metrics — Application metrics (requests, errors, response times)

VERIFY: AE-MON-001 — Health endpoint returns status, timestamp, uptime, version
VERIFY: AE-MON-002 — Metrics endpoint tracks request count and average response time

## Pagination

All list endpoints support pagination via query parameters:
- page: page number (default 1)
- limit: items per page (default 20, max MAX_PAGE_SIZE from @repo/shared)

VERIFY: AE-PERF-002 — Pagination enforces MAX_PAGE_SIZE limit

## Request/Response Format

- Validation: ValidationPipe with whitelist and forbidNonWhitelisted
- Errors: { statusCode, message, timestamp, correlationId }
- Lists: { data: T[], total: number }
