# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful endpoints for authentication,
dashboard management, widget management, data source management, audit logs,
and monitoring. All endpoints require JWT authentication unless marked @Public().
See [authentication.md](authentication.md) for auth details.

## Auth Endpoints

### POST /auth/register (Public)
- Creates new user with validated DTO
- Returns: { accessToken: string }
- Validates role against ALLOWED_REGISTRATION_ROLES (ADMIN excluded)

### POST /auth/login (Public)
- Authenticates user with email/password
- Returns: { accessToken: string }

### GET /auth/profile (Protected)
- Returns current user profile from JWT payload

## Dashboard Endpoints

- VERIFY: AE-DASH-001 — CreateDashboardDto validates title, description, and status
- VERIFY: AE-DASH-002 — DashboardService provides CRUD operations with tenant isolation
- VERIFY: AE-DASH-003 — DashboardController exposes CRUD endpoints with pagination and Cache-Control

### POST /dashboards — Create dashboard (requires auth)
### GET /dashboards — List dashboards with pagination, Cache-Control header
### GET /dashboards/:id — Get single dashboard
### PUT /dashboards/:id — Update dashboard
### DELETE /dashboards/:id — Delete dashboard (ADMIN role required via @Roles)

## Widget Endpoints

- VERIFY: AE-WIDG-001 — CreateWidgetDto validates title, type, config, position, size, refreshRate, dashboardId
- VERIFY: AE-WIDG-002 — WidgetService provides CRUD operations with tenant isolation and N+1 prevention
- VERIFY: AE-WIDG-003 — WidgetController exposes CRUD endpoints with pagination and Cache-Control

### POST /widgets — Create widget (requires auth)
### GET /widgets — List widgets with pagination, Cache-Control header
### GET /widgets/:id — Get single widget with dashboard and dataSource includes
### PUT /widgets/:id — Update widget
### DELETE /widgets/:id — Delete widget

## Data Source Endpoints

- VERIFY: AE-DS-001 — CreateDataSourceDto validates name, type, connectionUrl, status
- VERIFY: AE-DS-002 — DataSourceService provides CRUD with tenant isolation
- VERIFY: AE-DS-003 — DataSourceService uses $executeRaw for stats query
- VERIFY: AE-DS-004 — DataSourceController exposes CRUD with RBAC on create/update/delete

### POST /data-sources — Create data source (ADMIN/USER role)
### GET /data-sources — List data sources with pagination, Cache-Control header
### GET /data-sources/:id — Get single data source
### PUT /data-sources/:id — Update data source (ADMIN/USER role)
### DELETE /data-sources/:id — Delete data source (ADMIN role)

## Audit Log Endpoints

- VERIFY: AE-AUDIT-001 — CreateAuditLogDto validates action, entity, entityId, details
- VERIFY: AE-AUDIT-002 — AuditLogService creates and queries audit logs with tenant isolation
- VERIFY: AE-AUDIT-003 — AuditLogController exposes create and list endpoints (list requires ADMIN)

### POST /audit-logs — Create audit entry (requires auth)
### GET /audit-logs — List audit logs (ADMIN role required), Cache-Control header

## Pagination

All list endpoints support pagination query parameters:
- page (default: 1)
- pageSize (default: 20, max: 100)
- Page size is clamped to [1, MAX_PAGE_SIZE], never rejected

## Response Format

All list endpoints return: { data: T[], total: number, page: number, pageSize: number }
