# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful endpoints for authentication,
dashboard management, widget configuration, and data source operations.
All endpoints are tenant-scoped via JWT claims.

See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for entity relationships.

## Endpoint Inventory

### Auth Endpoints (Public)
- POST /auth/login — authenticate and receive JWT
- POST /auth/register — create new user account

### Dashboard Endpoints (Authenticated)
- POST /dashboards — create dashboard
- GET /dashboards — list dashboards (paginated)
- GET /dashboards/:id — get dashboard with widgets
- PUT /dashboards/:id — update dashboard
- DELETE /dashboards/:id — delete dashboard
- PATCH /dashboards/:id/publish — publish dashboard
- PATCH /dashboards/:id/archive — archive dashboard

### Widget Endpoints (Authenticated)
- POST /widgets — create widget
- GET /widgets/dashboard/:dashboardId — list widgets by dashboard
- GET /widgets/:id — get widget
- PUT /widgets/:id — update widget
- DELETE /widgets/:id — delete widget

### Data Source Endpoints (Authenticated)
- POST /data-sources — create data source
- GET /data-sources — list data sources (paginated)
- GET /data-sources/:id — get data source
- PUT /data-sources/:id — update data source
- DELETE /data-sources/:id — delete data source
- GET /data-sources/:id/sync-history — get sync runs

### Monitoring Endpoints (Public, Skip Throttle)
- GET /health — health check
- GET /health/ready — database connectivity check
- GET /metrics — in-memory request metrics

## Requirements

### VERIFY:AE-API-001
Auth endpoints (login, register) MUST be decorated with @Public()
and accessible without JWT authentication.

### VERIFY:AE-API-002
Dashboard CRUD endpoints MUST scope all queries by tenantId from
the authenticated user's JWT claims. No cross-tenant data access.

### VERIFY:AE-API-003
Widget endpoints MUST validate dashboard ownership by tenant before
creating or listing widgets.

### VERIFY:AE-API-004
Data source CRUD with sync history. DataSource endpoints MUST include
tenant-scoped queries and sync run retrieval.

## Pagination

All list endpoints support pagination via query parameters:
- page (default: 1, min: 1)
- pageSize (default: 20, max: 100, clamped not rejected)

Response format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "correlationId": "uuid-here",
  "timestamp": "2026-03-24T00:00:00.000Z"
}
```
