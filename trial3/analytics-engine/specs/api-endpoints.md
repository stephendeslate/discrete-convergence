# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful endpoints for authentication,
dashboard management, widget configuration, data source operations,
and monitoring. All endpoints (except public ones) require JWT authentication.

## Endpoint Groups

### Authentication

- POST /auth/login — Authenticate user, return JWT
- POST /auth/register — Create tenant + user, return JWT

### Dashboards

- POST /dashboards — Create dashboard (DRAFT)
- GET /dashboards — List dashboards (paginated)
- GET /dashboards/:id — Get dashboard by ID
- PATCH /dashboards/:id — Update dashboard
- DELETE /dashboards/:id — Delete dashboard
- PATCH /dashboards/:id/publish — Transition DRAFT to PUBLISHED
- PATCH /dashboards/:id/archive — Transition PUBLISHED to ARCHIVED

### Widgets

- POST /dashboards/:id/widgets — Create widget
- GET /dashboards/:id/widgets — List widgets (paginated)
- GET /dashboards/:dashboardId/widgets/:id — Get widget
- PATCH /widgets/:id — Update widget position/title
- DELETE /widgets/:id — Delete widget

### Data Sources

- POST /data-sources — Create data source
- GET /data-sources — List data sources (paginated)
- GET /data-sources/:id — Get data source
- PATCH /data-sources/:id — Update data source
- DELETE /data-sources/:id — Delete data source
- POST /data-sources/:id/sync — Trigger sync
- GET /data-sources/:id/sync-history — List sync runs

### Monitoring

- GET /health — Health check (public)
- GET /health/ready — Database connectivity check (public)
- GET /metrics — In-memory request metrics (public)

## Pagination

All list endpoints support pagination with `page` and `pageSize` query params.
Pagination uses clamping (not rejection) for out-of-range values.

- VERIFY:AE-PERF-001 — Pagination uses clampPagination from shared with
  MAX_PAGE_SIZE clamping instead of rejection

## Cache-Control

All list endpoints (findAll) include Cache-Control headers for client
and CDN caching optimization.

- VERIFY:AE-PERF-002 — ResponseTimeInterceptor uses performance.now()
  from perf_hooks and sets X-Response-Time header
- VERIFY:AE-PERF-003 — Dashboard list endpoint includes Cache-Control header
- VERIFY:AE-PERF-004 — Widget list endpoint includes Cache-Control header
- VERIFY:AE-PERF-005 — Data source list endpoint includes Cache-Control header

## DTO Validation

All DTOs use class-validator decorators:
- String fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Enum fields: @IsIn() with valid values

## Error Responses

All error responses include:
- statusCode: HTTP status code
- message: Human-readable error message
- correlationId: Request correlation ID for tracing
- timestamp: ISO 8601 timestamp
