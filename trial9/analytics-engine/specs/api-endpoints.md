# API Endpoints Specification

## Overview

The Analytics Engine API is built with NestJS 11 and provides RESTful endpoints
for authentication, dashboard management, widget management, data source management,
health monitoring, and metrics.

See also: [Authentication Specification](authentication.md) for auth flow details.

## Base URL

All endpoints are prefixed with the API base URL (configurable via PORT env var, default 3001).

## Authentication Endpoints

### POST /auth/register (Public)
- Body: RegisterDto (email, password, name, role, tenantId)
- Returns: { access_token: string }
- VERIFY: AE-DASH-002 — DashboardController provides CRUD endpoints with tenant context extraction

### POST /auth/login (Public)
- Body: LoginDto (email, password)
- Returns: { access_token: string }

### GET /auth/profile (Protected)
- Headers: Authorization: Bearer <token>
- Returns: JWT payload (sub, email, role, tenantId)

## Dashboard Endpoints

### POST /dashboards (Protected)
- VERIFY: AE-DASH-003 — Integration tests verify dashboard CRUD operations with auth

### GET /dashboards (Protected, Paginated)
- Query: page, pageSize
- Returns: { data, total, page, pageSize }
- Cache-Control header on response

### GET /dashboards/:id (Protected)
### PUT /dashboards/:id (Protected)
### DELETE /dashboards/:id (Protected, Admin Only)

### GET /dashboards/stats/summary (Protected, Admin Only)

## Widget Endpoints

- VERIFY: AE-WIDG-002 — WidgetController provides CRUD endpoints with tenant context

### POST /widgets (Protected)
### GET /widgets (Protected, Paginated, Cache-Control)
### GET /widgets/:id (Protected)
### PUT /widgets/:id (Protected)
### DELETE /widgets/:id (Protected)

## Data Source Endpoints

- VERIFY: AE-DS-002 — DataSourceController provides CRUD endpoints with tenant context

### POST /data-sources (Protected)
### GET /data-sources (Protected, Paginated, Cache-Control)
### GET /data-sources/:id (Protected)
### PUT /data-sources/:id (Protected)
### DELETE /data-sources/:id (Protected)

## Monitoring Endpoints

### GET /health (Public, SkipThrottle)
- Returns: status, timestamp, uptime, version

### GET /health/ready (Public, SkipThrottle)
- Returns: status, database connectivity, timestamp

### GET /metrics (Public, SkipThrottle)
- Returns: requestCount, errorCount, averageResponseTime, uptime

## Common Response Patterns

### Pagination
- All list endpoints accept page and pageSize query parameters
- pageSize is clamped to MAX_PAGE_SIZE (100), default 20

### Error Response
- statusCode, message, error, correlationId, timestamp
- No stack traces in production (sanitized by GlobalExceptionFilter)
