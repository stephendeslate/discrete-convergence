# Dashboards Specification

## Overview

Dashboards are the primary container for widgets in the Analytics Engine.
Each dashboard belongs to a user within a tenant and can contain multiple widgets.

## Domain Model

- id: UUID
- name: String (required, max 255 chars)
- description: String (optional, max 1000 chars)
- userId: FK to User
- tenantId: String (for RLS)
- isPublic: Boolean (default false)
- widgets: Widget[] (one-to-many relation)

## CRUD Operations

### Create Dashboard
- POST /dashboards
- Requires JWT + TenantGuard
- Body: { name, description?, isPublic? }
- Sets userId from authenticated user
- Sets tenantId from user context

### List Dashboards
- GET /dashboards?page=1&limit=10
- Returns paginated results scoped to tenant
- Includes total count for pagination UI

### Get Dashboard
- GET /dashboards/:id
- Returns single dashboard with optional widget include

### Get Dashboard Data
- GET /dashboards/:id/data
- Returns dashboard with all widgets and their data
- Branching logic: if includeWidgets, fetches nested widgets

### Update Dashboard
- PATCH /dashboards/:id
- Partial update of name, description, isPublic

### Delete Dashboard
- DELETE /dashboards/:id
- Cascades to associated widgets

<!-- VERIFY:DASH-CRUD — Full CRUD operations for dashboards -->
<!-- VERIFY:DASH-TENANT-SCOPE — All dashboard queries scoped to tenant -->

## Service Layer

DashboardService methods:
- create(userId, tenantId, dto): Creates dashboard with tenant context
- findAll(tenantId, pagination): Paginated list with tenant filter
- findOne(id, tenantId): Single dashboard lookup (findFirst justified: lookup by ID within tenant)
- getData(id, tenantId, includeWidgets): Dashboard with optional widget data
- update(id, tenantId, dto): Partial update
- remove(id, tenantId): Soft or hard delete

## Validation

- name: @IsString(), @MaxLength(255)
- description: @IsOptional(), @IsString(), @MaxLength(1000)
- isPublic: @IsOptional(), @IsBoolean()

## Access Control

- All endpoints require AuthGuard('jwt') and TenantGuard
- Dashboard owner or tenant admin can modify
- RLS at database level ensures tenant isolation

## Implementation Traceability

<!-- VERIFY:AE-DASH-001 — DashboardService create method -->
<!-- VERIFY:AE-DASH-002 — DashboardService findAll with pagination -->
<!-- VERIFY:AE-DASH-003 — DashboardService findOne by ID -->
<!-- VERIFY:AE-DASH-004 — DashboardService getData with widget include -->
<!-- VERIFY:AE-DASH-005 — DashboardService update method -->
<!-- VERIFY:AE-DASH-006 — DashboardService remove method -->
<!-- VERIFY:AE-DASH-007 — Dashboard audit logging -->
<!-- VERIFY:AE-DASH-CTRL-001 — Dashboard controller with CRUD endpoints -->
<!-- VERIFY:AE-DASH-DTO-001 — CreateDashboardDto validation -->
<!-- VERIFY:AE-DASH-DTO-002 — UpdateDashboardDto validation -->
<!-- VERIFY:AE-DASH-MOD-001 — DashboardModule definition -->
<!-- VERIFY:DASH-CTRL — Dashboard controller implementation -->
<!-- VERIFY:DASH-CTRL-TEST — Dashboard controller unit tests -->
<!-- VERIFY:DASH-DTO-CREATE — CreateDashboardDto class -->
<!-- VERIFY:DASH-DTO-UPDATE — UpdateDashboardDto class -->
<!-- VERIFY:DASH-INT-SUITE — Dashboard integration test suite -->
<!-- VERIFY:DASH-MOD — Dashboard module definition -->
<!-- VERIFY:DASH-SVC — Dashboard service implementation -->
<!-- VERIFY:DASH-SVC-TEST — Dashboard service unit tests -->
