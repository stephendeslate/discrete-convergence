# API Endpoints Specification

## Overview

The Analytics Engine API provides RESTful endpoints for authentication, dashboard
management, widget configuration, data source management, query execution tracking,
and system monitoring. All domain endpoints require JWT authentication.

See also: [Authentication](authentication.md) for auth flow details.
See also: [Data Model](data-model.md) for entity definitions.

## Authentication Endpoints

### POST /auth/register
- Public endpoint (no auth required)
- Body: email, password, name, role, tenantId
- Returns: user profile without password
- Validates role against ALLOWED_REGISTRATION_ROLES

### POST /auth/login
- Public endpoint (no auth required)
- Body: email, password
- Returns: access_token and user profile

## Dashboard Endpoints

### POST /dashboards
- Create a new dashboard
- Requires authentication
- Body: name, description (optional), status (optional)
- VERIFY: AE-DASH-001 — Dashboard DTO validates name, description, status

### GET /dashboards
- List dashboards with pagination
- Scoped to authenticated user's tenant
- VERIFY: AE-DASH-002 — Dashboard service scopes queries by tenantId

### GET /dashboards/:id
- Get dashboard by ID with widgets included
- VERIFY: AE-DASH-003 — Dashboard controller extracts tenant from request

### PUT /dashboards/:id
- Update dashboard properties
- Validates tenant ownership

### DELETE /dashboards/:id
- Delete dashboard (ADMIN only via @Roles)

## Widget Endpoints

### POST /widgets
- Create widget attached to a dashboard
- VERIFY: AE-WIDGET-001 — Widget DTO validates name, type, config, dashboardId

### GET /widgets
- List all widgets for tenant with pagination
- VERIFY: AE-WIDGET-002 — Widget service includes related dashboard and data source

### GET /widgets/:id
- Get widget by ID with relations
- VERIFY: AE-WIDGET-003 — Widget controller scopes by tenant

### PUT /widgets/:id — Update widget
### DELETE /widgets/:id — Delete widget

## Data Source Endpoints

### POST /data-sources (ADMIN only)
- VERIFY: AE-DS-001 — DataSource DTO validates name, type, connectionString
### GET /data-sources — List with pagination
### GET /data-sources/stats — Connection statistics
- VERIFY: AE-DS-002 — DataSource service uses $executeRaw for stats query
### GET /data-sources/:id — Get by ID
### PUT /data-sources/:id (ADMIN only)
### DELETE /data-sources/:id (ADMIN only)
- VERIFY: AE-DS-003 — DataSource service uses Prisma.sql for raw queries
- VERIFY: AE-DS-004 — DataSource controller enforces RBAC with @Roles

## Query Endpoints

### POST /queries — Create query execution record
- VERIFY: AE-QUERY-001 — Query DTO validates query text, dataSourceId
### GET /queries — List query executions with pagination
- VERIFY: AE-QUERY-002 — Query service scopes by tenant
### GET /queries/:id — Get query execution by ID
### DELETE /queries/:id — Delete query execution
- VERIFY: AE-QUERY-003 — Query controller extracts tenant from request

## Pagination

All list endpoints support pagination with `page` and `limit` query parameters.
Page size is clamped to MAX_PAGE_SIZE (100) from shared package.
