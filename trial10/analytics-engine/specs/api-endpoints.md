# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful endpoints for managing dashboards,
widgets, data sources, and monitoring. All domain endpoints require JWT authentication
and scope queries by tenant ID from the JWT payload.

See also: [Authentication](authentication.md) for auth flow details.
See also: [Security](security.md) for access control rules.

## Auth Endpoints

### POST /auth/register
Public endpoint. Creates a new user account.
Request body: RegisterDto (email, password, name, role, tenantId).
Returns: { access_token: string }

### POST /auth/login
Public endpoint. Authenticates an existing user.
Request body: LoginDto (email, password).
Returns: { access_token: string }

### GET /auth/profile
Authenticated endpoint. Returns current user profile from JWT.
Returns: { sub, email, role, tenantId }

## Dashboard Endpoints

VERIFY: AE-DASH-001
DashboardService implements CRUD operations with tenant isolation.
All queries filter by tenantId from JWT payload.

VERIFY: AE-DASH-002
DashboardController scopes all queries by tenant:
- POST /dashboards — create dashboard (tenantId from JWT)
- GET /dashboards — list dashboards (paginated, with Cache-Control)
- GET /dashboards/:id — get single dashboard
- PUT /dashboards/:id — update dashboard
- DELETE /dashboards/:id — delete dashboard (ADMIN only via @Roles)
- GET /dashboards/stats/summary — dashboard stats (ADMIN only)

VERIFY: AE-DASH-003
Dashboard integration tests verify CRUD operations with supertest and
real AppModule compilation. Tests include positive, negative, and auth tests.

VERIFY: AE-DASH-004
Dashboard service unit tests include behavioral assertions with
toHaveBeenCalledWith for every mocked Prisma method.

## Widget Endpoints

VERIFY: AE-WIDGET-001
WidgetService implements CRUD with tenant isolation and pagination.

VERIFY: AE-WIDGET-002
WidgetController routes:
- POST /widgets — create widget
- GET /widgets — list widgets (paginated, with Cache-Control)
- GET /widgets/:id — get widget
- PUT /widgets/:id — update widget
- DELETE /widgets/:id — delete widget

VERIFY: AE-WIDGET-003
Widget service unit tests verify behavioral assertions for all operations.

## DataSource Endpoints

VERIFY: AE-DS-001
DataSourceService implements CRUD with tenant isolation.

VERIFY: AE-DS-002
DataSourceController routes:
- POST /data-sources — create data source
- GET /data-sources — list data sources (paginated, with Cache-Control)
- GET /data-sources/:id — get data source
- PUT /data-sources/:id — update data source
- DELETE /data-sources/:id — delete data source

VERIFY: AE-DS-003
DataSource service unit tests verify all CRUD operations with behavioral assertions.

## Pagination

All list endpoints support page and pageSize query parameters.
Page size is clamped to MAX_PAGE_SIZE (100), not rejected.
Default page size is DEFAULT_PAGE_SIZE (20).
