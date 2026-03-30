# API Endpoints Specification

## Overview

The Analytics Engine API is built with NestJS and provides RESTful CRUD endpoints
for dashboards, data sources, and widgets. All domain endpoints require JWT auth
and scope by tenant.

See also: [Authentication](authentication.md) for auth endpoints.
See also: [Monitoring](monitoring.md) for health and metrics endpoints.

## Auth Endpoints

### POST /auth/register
- Public endpoint (no auth required)
- Body: RegisterDto (email, password, name, role, tenantId)
- Returns: user object (id, email, name, role)
- Rejects ADMIN role registration

### POST /auth/login
- Public endpoint (no auth required)
- Body: LoginDto (email, password)
- Returns: { access_token, user }

## Dashboard Endpoints

VERIFY: AE-DASH-001
CreateDashboardDto validates name, description, isPublic with class-validator decorators.

VERIFY: AE-DASH-002
DashboardService implements full CRUD scoped by tenantId.

VERIFY: AE-DASH-003
Dashboard findAll returns paginated results with total count.

VERIFY: AE-DASH-004
Dashboard controller at /dashboards with tenant-scoped CRUD.

VERIFY: AE-DASH-005
Dashboard delete requires ADMIN role via @Roles decorator.

### POST /dashboards — Create dashboard (auth required)
### GET /dashboards — List dashboards with pagination (auth required)
### GET /dashboards/:id — Get dashboard by ID (auth required)
### PUT /dashboards/:id — Update dashboard (auth required)
### DELETE /dashboards/:id — Delete dashboard (ADMIN only)

## Data Source Endpoints

VERIFY: AE-DS-001
CreateDataSourceDto validates name, type, config, refreshRate.

VERIFY: AE-DS-002
DataSourceService implements CRUD with tenant isolation.

VERIFY: AE-DS-003
DataSource findAll returns paginated results.

VERIFY: AE-DS-004
DataSource controller at /data-sources with full CRUD.

### POST /data-sources — Create data source (ADMIN only)
### GET /data-sources — List data sources with pagination (auth required)
### GET /data-sources/:id — Get data source by ID (auth required)
### PUT /data-sources/:id — Update data source (auth required)
### DELETE /data-sources/:id — Delete data source (ADMIN only)

## Widget Endpoints

VERIFY: AE-WID-001
CreateWidgetDto validates name, type, config, dashboardId, dataSourceId.

VERIFY: AE-WID-002
WidgetService implements CRUD with tenant isolation and relation includes.

VERIFY: AE-WID-003
Widget findAll returns paginated results.

VERIFY: AE-WID-004
Widget controller at /widgets with full CRUD.

### POST /widgets — Create widget (auth required)
### GET /widgets — List widgets with pagination (auth required)
### GET /widgets/:id — Get widget by ID (auth required)
### PUT /widgets/:id — Update widget (auth required)
### DELETE /widgets/:id — Delete widget (auth required)

## Pagination

All list endpoints accept page and pageSize query parameters.
Page size is clamped to MAX_PAGE_SIZE (100) from shared constants.
Default page size is 20 (DEFAULT_PAGE_SIZE from shared).
