# API Endpoints Specification

## Overview

The Analytics Engine API exposes RESTful endpoints for authentication, dashboards,
widgets, data sources, sync history, audit logs, and monitoring.

## Authentication

### VERIFY: AE-API-001 — Auth endpoints
POST /auth/register — Create new user account (public)
POST /auth/login — Authenticate and receive JWT (public)

## Dashboards

### VERIFY: AE-API-002 — Dashboard CRUD
POST /dashboards — Create dashboard
GET /dashboards — List dashboards with pagination
GET /dashboards/:id — Get dashboard by ID
PUT /dashboards/:id — Update dashboard
DELETE /dashboards/:id — Delete dashboard

### VERIFY: AE-API-003 — Dashboard lifecycle
PATCH /dashboards/:id/publish — Publish a draft dashboard
PATCH /dashboards/:id/archive — Archive a dashboard

## Widgets

### VERIFY: AE-API-004 — Widget CRUD
POST /dashboards/:id/widgets — Add widget to dashboard
GET /dashboards/:id/widgets — List widgets for dashboard
GET /widgets/:id/data — Get widget data
PUT /widgets/:id — Update widget
DELETE /widgets/:id — Delete widget

## Data Sources

### VERIFY: AE-API-005 — DataSource CRUD
POST /data-sources — Create data source
GET /data-sources — List data sources with pagination
GET /data-sources/:id — Get data source by ID
PUT /data-sources/:id — Update data source
DELETE /data-sources/:id — Delete data source

### VERIFY: AE-API-006 — DataSource operations
POST /data-sources/:id/test-connection — Test data source connectivity
POST /data-sources/:id/sync — Trigger data synchronization

## Sync History

### VERIFY: AE-API-007 — Sync history
GET /data-sources/:id/sync-history — List sync runs for data source

## Audit Log

### VERIFY: AE-API-008 — Audit log
GET /audit-log — List audit log entries with pagination

## Monitoring

### VERIFY: AE-API-009 — Health endpoints
GET /health — Basic health check (public)
GET /health/ready — Readiness check with database probe (public)
GET /metrics — Application metrics (protected)

## Common Patterns

All list endpoints support pagination via `page` and `pageSize` query parameters.
Page size is clamped to a maximum of 100.
All protected endpoints require `Authorization: Bearer <token>` header.
Responses include `x-correlation-id` header for request tracing.

## Error Responses

| Status | Meaning | When |
|--------|---------|------|
| 400 | Bad Request | Validation failure, invalid state transition |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Resource does not exist or not in tenant scope |
| 409 | Conflict | Duplicate name or unique constraint violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## Cross-References

- Data model definitions: See [data-model.md](data-model.md)
- Authentication details: See [authentication.md](authentication.md)
- Rate limiting: See [security.md](security.md)
