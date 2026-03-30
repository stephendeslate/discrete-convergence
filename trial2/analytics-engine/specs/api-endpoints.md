# API Endpoints Specification

## Overview

The Analytics Engine API is a NestJS 11 application providing RESTful endpoints
for multi-tenant analytics management. All domain endpoints require JWT authentication
via a global APP_GUARD. Public routes use the @Public() decorator.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Login with email/password |
| POST | /auth/register | Public | Register new user + tenant |
| POST | /auth/refresh | Public | Refresh JWT tokens |

## Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /dashboards | JWT | Create dashboard |
| GET | /dashboards | JWT | List dashboards (paginated) |
| GET | /dashboards/:id | JWT | Get dashboard by ID |
| PATCH | /dashboards/:id | JWT | Update dashboard |
| DELETE | /dashboards/:id | JWT | Delete dashboard |
| PATCH | /dashboards/:id/publish | JWT | Publish dashboard |
| PATCH | /dashboards/:id/archive | JWT | Archive dashboard |

## Widget Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /dashboards/:dashboardId/widgets | JWT | Create widget |
| GET | /dashboards/:dashboardId/widgets | JWT | List widgets (paginated) |
| GET | /widgets/:id | JWT | Get widget by ID |
| PATCH | /widgets/:id | JWT | Update widget |
| PATCH | /widgets/:id/position | JWT | Update widget position |
| DELETE | /widgets/:id | JWT | Delete widget |

## DataSource Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /data-sources | JWT | Create data source |
| GET | /data-sources | JWT | List data sources (paginated) |
| GET | /data-sources/:id | JWT | Get data source by ID |
| PATCH | /data-sources/:id | JWT | Update data source |
| DELETE | /data-sources/:id | JWT | Delete data source |
| POST | /data-sources/:id/sync | JWT | Trigger sync |
| GET | /data-sources/:id/sync-history | JWT | Get sync history |

## Requirements

<!-- VERIFY:AE-DASH-001 — Dashboard service provides CRUD + publish/archive operations -->
- REQ-DASH-001: Dashboard service must support full CRUD plus publish and archive

<!-- VERIFY:AE-DASH-002 — Dashboard controller includes Cache-Control on list endpoint -->
- REQ-DASH-002: GET /dashboards must include Cache-Control header

<!-- VERIFY:AE-WIDG-001 — Widget service provides CRUD + position update -->
- REQ-WIDG-001: Widget service must support CRUD plus position update

<!-- VERIFY:AE-WIDG-002 — Widget controller includes Cache-Control on list endpoint -->
- REQ-WIDG-002: GET /dashboards/:id/widgets must include Cache-Control header

<!-- VERIFY:AE-DS-001 — DataSource service provides CRUD + sync + history -->
- REQ-DS-001: DataSource service must support full CRUD plus sync and sync history

<!-- VERIFY:AE-DS-002 — DataSource service uses $executeRaw with Prisma.sql for safe queries -->
- REQ-DS-002: At least one service method must use $executeRaw(Prisma.sql`...`)

<!-- VERIFY:AE-DS-003 — DataSource controller includes Cache-Control on list endpoint -->
- REQ-DS-003: GET /data-sources must include Cache-Control header

## Pagination

All list endpoints support pagination with `page` and `pageSize` query parameters.
See [monitoring.md](monitoring.md) for performance requirements.

- Page size is clamped, not rejected, to [1, 100]
- Default page size is 20

## Response Format

List endpoints return:
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

## Error Responses

All errors include correlationId in the response body:
```json
{
  "statusCode": 404,
  "message": "Dashboard not found",
  "correlationId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
