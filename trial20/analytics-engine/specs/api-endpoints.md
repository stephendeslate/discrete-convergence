# API Endpoints Specification

## Overview

The Analytics Engine API follows RESTful conventions with NestJS 11 controllers.
All endpoints except those decorated with @Public() require JWT authentication.
Request validation uses class-validator with whitelist and forbidNonWhitelisted modes.
Pagination follows the shared package's clampPagination utility for consistent defaults.

See also: authentication.md for the auth flow and guard chain details.
See also: data-model.md for entity structures returned by these endpoints.
See also: monitoring.md for health and metrics endpoints.

## Auth Endpoints

### POST /auth/register
- Public: Yes (@Public + @Throttle)
- Body: { email: string, password: string, role: 'VIEWER' }
- Response 201: { id, email, role }
- Response 400: Validation errors
- Response 409: Email already exists

VERIFY: AE-DASH-001 — Dashboard CRUD endpoints enforce tenant isolation in all queries
VERIFY: AE-DASH-002 — Dashboard update validates ownership within tenant scope
VERIFY: AE-DASH-003 — Dashboard delete restricted to ADMIN role

### POST /auth/login
- Public: Yes (@Public + @Throttle)
- Body: { email: string, password: string }
- Response 200: { accessToken, refreshToken }
- Response 401: Invalid credentials

## Dashboard Endpoints

### GET /dashboards
- Auth: Required
- Query: page (default 1), limit (default 20, max 100)
- Response 200: { data: Dashboard[], total: number, page: number, limit: number }

### POST /dashboards
- Auth: Required
- Body: { name: string, description?: string }
- Response 201: Dashboard

### GET /dashboards/:id
- Auth: Required
- Response 200: Dashboard
- Response 404: Not found (within tenant scope)

### PATCH /dashboards/:id
- Auth: Required
- Body: Partial<{ name, description, status }>
- Response 200: Dashboard

### DELETE /dashboards/:id
- Auth: Required, Role: ADMIN
- Response 200: { deleted: true }

VERIFY: AE-DS-001 — Data source CRUD endpoints enforce tenant isolation in all queries
VERIFY: AE-DS-002 — Data source update validates ownership within tenant scope
VERIFY: AE-DS-003 — Data source delete restricted to ADMIN role

## Data Source Endpoints

### GET /data-sources
- Auth: Required
- Query: page, limit
- Response 200: { data: DataSource[], total, page, limit }

### POST /data-sources
- Auth: Required
- Body: { name: string, type: string, connectionString: string }
- Response 201: DataSource

### GET /data-sources/:id
- Auth: Required
- Response 200: DataSource

### PATCH /data-sources/:id
- Auth: Required
- Body: Partial<{ name, type, connectionString, status }>
- Response 200: DataSource

### DELETE /data-sources/:id
- Auth: Required, Role: ADMIN
- Response 200: { deleted: true }

VERIFY: AE-WID-001 — Widget CRUD endpoints enforce tenant isolation in all queries
VERIFY: AE-WID-002 — Widget update validates ownership within tenant scope
VERIFY: AE-WID-003 — Widget delete restricted to ADMIN role

## Widget Endpoints

### GET /widgets
- Auth: Required
- Query: dashboardId (optional), page, limit
- Response 200: { data: Widget[], total, page, limit }

### POST /widgets
- Auth: Required
- Body: { name, type, config, dashboardId, dataSourceId? }
- Response 201: Widget

### GET /widgets/:id
- Auth: Required
- Response 200: Widget

### PATCH /widgets/:id
- Auth: Required
- Body: Partial<{ name, type, config }>
- Response 200: Widget

### DELETE /widgets/:id
- Auth: Required, Role: ADMIN
- Response 200: { deleted: true }

## Pagination

All list endpoints support pagination with:
- page: minimum 1, default 1
- limit: minimum 1, maximum MAX_PAGE_SIZE (100), default DEFAULT_PAGE_SIZE (20)
- Pagination values are clamped using shared clampPagination utility

## Error Response Format

All errors follow a consistent JSON format:
- statusCode: HTTP status code
- message: Human-readable error message
- error: Error type string
- correlationId: X-Correlation-ID for request tracing
