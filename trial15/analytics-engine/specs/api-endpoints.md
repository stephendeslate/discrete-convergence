# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful CRUD endpoints for dashboards, widgets, and data sources, plus authentication and monitoring endpoints. All domain endpoints are protected by JWT authentication with tenant scoping.

See also: [authentication.md](authentication.md) for auth flow, [security.md](security.md) for guard configuration.

## Auth Endpoints

VERIFY: AE-API-001 — AuthController exposes POST /auth/register and POST /auth/login as @Public endpoints

### POST /auth/register
- Body: RegisterDto (email, password, tenantId, role)
- Returns: User object (id, email, role, tenantId)
- Public: yes (no auth required)

### POST /auth/login
- Body: LoginDto (email, password)
- Returns: { access_token, user }
- Public: yes (no auth required)

## Dashboard Endpoints

VERIFY: AE-API-002 — DashboardService implements create, findAll, findOne, update, remove with tenant isolation

VERIFY: AE-API-003 — DashboardController scopes all operations by tenant from req.user.tenantId

### POST /dashboards
- Body: CreateDashboardDto (title, description?, status?)
- Returns: Dashboard with widgets
- Auth: required, any role

### GET /dashboards
- Query: page, pageSize
- Returns: Paginated dashboards
- Auth: required, scoped by tenant

### GET /dashboards/:id
- Returns: Single dashboard with widgets
- Auth: required, scoped by tenant

### PUT /dashboards/:id
- Body: UpdateDashboardDto
- Returns: Updated dashboard
- Auth: required, scoped by tenant

### DELETE /dashboards/:id
- Returns: 204 No Content
- Auth: required, ADMIN role only

## Widget Endpoints

VERIFY: AE-API-004 — WidgetService implements CRUD with tenant isolation and include for N+1 prevention

VERIFY: AE-API-005 — WidgetController provides full CRUD with @Roles('ADMIN') on delete

### POST /widgets — Create widget (any role)
### GET /widgets — List widgets (paginated, tenant-scoped)
### GET /widgets/:id — Get widget by ID
### PUT /widgets/:id — Update widget
### DELETE /widgets/:id — Delete widget (ADMIN only)

## Data Source Endpoints

VERIFY: AE-API-006 — DataSourceService implements CRUD with tenant isolation

VERIFY: AE-API-007 — DataSourceController uses @Roles('ADMIN') on create, update, delete

### POST /data-sources — Create data source (ADMIN only)
### GET /data-sources — List data sources (paginated)
### GET /data-sources/:id — Get data source by ID
### PUT /data-sources/:id — Update data source (ADMIN only)
### DELETE /data-sources/:id — Delete data source (ADMIN only)

## Response Format

All list endpoints return paginated responses: { data, total, page, pageSize }
All endpoints include X-Response-Time header via ResponseTimeInterceptor.
