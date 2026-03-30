# API Endpoints Specification

> **Project:** Analytics Engine
> **Category:** API
> **Related:** See [authentication.md](authentication.md) for auth endpoints, see [data-model.md](data-model.md) for entity definitions

---

## Overview

The analytics engine REST API is built with NestJS 11 and provides CRUD operations for dashboards, widgets, data sources, and sync management. All endpoints are protected by the global JWT auth guard except those decorated with `@Public()`. DTOs use class-validator decorators for input validation. List endpoints support pagination using shared package utilities.

---

## Requirements

### VERIFY: AE-API-001 — Dashboard CRUD with tenant-scoped queries

The DashboardController provides full CRUD endpoints: `POST /dashboards` (create), `GET /dashboards` (list with pagination), `GET /dashboards/:id` (find one), `PATCH /dashboards/:id` (update), `DELETE /dashboards/:id` (soft delete/archive). All queries are scoped to the authenticated user's `tenantId` extracted from the JWT token payload. The service layer filters by `tenantId` on every query — there is no endpoint that returns dashboards across tenants. Create returns 201, successful update returns 200, not found returns 404, and delete sets status to ARCHIVED rather than removing the record.

### VERIFY: AE-API-002 — Widget CRUD with dashboard association

The WidgetController provides CRUD endpoints for widgets associated with dashboards: `POST /dashboards/:dashboardId/widgets` (create widget on dashboard), `GET /dashboards/:dashboardId/widgets` (list widgets for dashboard), `PATCH /widgets/:id` (update widget), `DELETE /widgets/:id` (delete widget). Widget creation validates the widget type against the `WidgetType` enum and accepts a `config` JSON field for type-specific configuration. The widget `position` field determines display order on the dashboard. All widget queries verify the parent dashboard belongs to the requesting user's tenant.

### VERIFY: AE-API-003 — DataSource CRUD with sync trigger and history

The DataSourceController provides CRUD endpoints: `POST /data-sources` (create), `GET /data-sources` (list), `GET /data-sources/:id` (find one), `PATCH /data-sources/:id` (update), `DELETE /data-sources/:id` (delete). Additional endpoints: `POST /data-sources/:id/sync` triggers a synchronization run and creates a SyncHistory record with status RUNNING, `GET /data-sources/:id/sync-history` returns paginated sync history for the data source. All operations are tenant-scoped. Triggering sync on a non-existent data source returns 404.

### VERIFY: AE-API-004 — Pagination with clampPagination from shared (MAX_PAGE_SIZE=100)

List endpoints use `clampPagination` imported from the shared package (`packages/shared/src/index.ts`). The function clamps `page` to minimum 1 and `limit` to a range of 1 through `MAX_PAGE_SIZE` (100). When no `limit` query parameter is provided, `DEFAULT_PAGE_SIZE` (20) is used. Invalid or missing values are clamped rather than rejected — negative page becomes 1, limit exceeding 100 becomes 100, and zero limit becomes `DEFAULT_PAGE_SIZE`. The pagination response includes `data` (array), `total` (count), `page`, and `limit` fields.

---

## Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, returns JWT |
| POST | /auth/refresh | Public | Refresh token |
| GET | /dashboards | JWT | List dashboards (paginated) |
| POST | /dashboards | JWT | Create dashboard |
| GET | /dashboards/:id | JWT | Get dashboard by ID |
| PATCH | /dashboards/:id | JWT | Update dashboard |
| DELETE | /dashboards/:id | JWT | Archive dashboard |
| POST | /dashboards/:did/widgets | JWT | Create widget |
| GET | /dashboards/:did/widgets | JWT | List widgets for dashboard |
| PATCH | /widgets/:id | JWT | Update widget |
| DELETE | /widgets/:id | JWT | Delete widget |
| GET | /data-sources | JWT | List data sources |
| POST | /data-sources | JWT | Create data source |
| GET | /data-sources/:id | JWT | Get data source |
| PATCH | /data-sources/:id | JWT | Update data source |
| DELETE | /data-sources/:id | JWT | Delete data source |
| POST | /data-sources/:id/sync | JWT | Trigger sync |
| GET | /data-sources/:id/sync-history | JWT | Get sync history |
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |

---

## DTO Validation Rules

All request DTOs use class-validator decorators:
- String fields: `@IsString()` + `@MaxLength()`
- UUID fields: `@IsString()` + `@MaxLength(36)`
- Email fields: `@IsEmail()` + `@IsString()` + `@MaxLength(255)`
- Enum fields: `@IsEnum(EnumType)` or `@IsIn(allowedValues)`
- Optional fields: `@IsOptional()` preceding other validators
- Nested objects: `@ValidateNested()` + `@Type(() => NestedDto)`
