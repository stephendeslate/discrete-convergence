# API Endpoints Specification

## Overview

Complete REST API reference for the Analytics Engine backend. All endpoints except auth and health require JWT authentication.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user and tenant |
| POST | /auth/login | Public | Authenticate and receive JWT |

## Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboards | JWT | List dashboards with pagination |
| POST | /dashboards | JWT | Create new dashboard |
| GET | /dashboards/:id | JWT | Get single dashboard |
| PATCH | /dashboards/:id | JWT | Update dashboard |
| DELETE | /dashboards/:id | JWT | Delete dashboard |
| PATCH | /dashboards/:id/publish | JWT | Publish draft dashboard |
| PATCH | /dashboards/:id/archive | JWT | Archive dashboard |

## Widget Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboards/:id/widgets | JWT | List widgets for dashboard |
| POST | /dashboards/:id/widgets | JWT | Create widget on dashboard |
| GET | /widgets/:id/data | JWT | Get widget data |
| PATCH | /widgets/:id/position | JWT | Update widget position |
| DELETE | /widgets/:id | JWT | Delete widget |

## Data Source Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /data-sources | JWT | List data sources with pagination |
| POST | /data-sources | JWT | Create new data source |
| GET | /data-sources/:id | JWT | Get single data source |
| PATCH | /data-sources/:id | JWT | Update data source |
| DELETE | /data-sources/:id | JWT | Delete data source |
| POST | /data-sources/:id/test-connection | JWT | Test data source connection |
| POST | /data-sources/:id/sync | JWT | Trigger data sync |
| GET | /data-sources/:id/sync-history | JWT | List sync history |

## Monitoring Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |
| GET | /metrics | JWT | Application metrics |

## Audit Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /audit-log | JWT | List audit logs with pagination |

## Pagination

All list endpoints support pagination via query parameters:
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 20, min: 1, max: 100)

Response format:
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

## Verification

<!-- VERIFY: AE-API-001 — All CRUD endpoints return correct HTTP status codes -->
<!-- VERIFY: AE-API-002 — Pagination clamping enforces min/max limits -->
<!-- VERIFY: AE-API-003 — Protected endpoints return 401 without valid token -->
<!-- VERIFY: AE-API-004 — Dashboard publish/archive enforce status constraints -->

## Dashboard Domain Implementation

<!-- VERIFY: AE-DASH-001 — Create dashboard with tenant isolation -->
<!-- VERIFY: AE-DASH-002 — Find all dashboards with pagination -->
<!-- VERIFY: AE-DASH-003 — Find one dashboard by ID and tenant -->
<!-- VERIFY: AE-DASH-004 — Update dashboard with name validation -->
<!-- VERIFY: AE-DASH-005 — Delete dashboard by ID -->
<!-- VERIFY: AE-DASH-006 — Publish dashboard transitions draft to published -->
<!-- VERIFY: AE-DASH-007 — Archive dashboard transitions published to archived -->

## Widget Domain Implementation

<!-- VERIFY: AE-WIDGET-001 — Create widget within dashboard -->
<!-- VERIFY: AE-WIDGET-002 — Get widget by ID with tenant verification -->
<!-- VERIFY: AE-WIDGET-003 — Max widget per dashboard enforcement -->
<!-- VERIFY: AE-WIDGET-004 — Get widget data validates data source exists -->
<!-- VERIFY: AE-WIDGET-005 — Delete widget by ID -->

## Data Source Domain Implementation

<!-- VERIFY: AE-DS-001 — Create data source with tenant isolation -->
<!-- VERIFY: AE-DS-002 — List data sources with pagination -->
<!-- VERIFY: AE-DS-003 — Find one data source by ID -->
<!-- VERIFY: AE-DS-004 — Update data source properties -->
<!-- VERIFY: AE-DS-005 — Delete data source by ID -->
<!-- VERIFY: AE-DS-006 — Test connection checks data source status -->
<!-- VERIFY: AE-DS-007 — Sync validates data source is not paused -->

## Audit & Sync Implementation

<!-- VERIFY: AE-AUDIT-001 — List audit logs with pagination and tenant scope -->
<!-- VERIFY: AE-AUDIT-002 — Create audit log entry for domain actions -->
<!-- VERIFY: AE-SYNC-001 — List sync history for data source -->
<!-- VERIFY: AE-SYNC-002 — Get sync run detail by ID -->

## Cross-Cutting Concerns

<!-- VERIFY: AE-CROSS-001 — Correlation ID propagation through request lifecycle -->
<!-- VERIFY: AE-CROSS-002 — Global exception filter with structured logging -->
