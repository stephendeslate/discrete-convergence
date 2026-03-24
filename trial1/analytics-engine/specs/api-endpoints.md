# API Endpoints Specification

> **Project:** Analytics Engine
> **Category:** API
> **Related:** See [authentication.md](authentication.md) for auth endpoints, see [data-model.md](data-model.md) for entity definitions

---

## Overview

The analytics engine REST API is built with NestJS 11 and provides CRUD operations for dashboards, widgets, data sources, and embed configuration. All endpoints are protected by global JWT auth guard except those decorated with `@Public()`. DTOs use class-validator decorators for input validation.

---

## Requirements

### VERIFY:AE-API-001 — Dashboard CRUD controller

The DashboardController provides full CRUD endpoints: `POST /dashboards` (create), `GET /dashboards` (list with pagination), `GET /dashboards/:id` (find one), `PATCH /dashboards/:id` (update), `DELETE /dashboards/:id` (soft delete/archive). List endpoints support pagination with `page` and `limit` query parameters clamped to MAX_PAGE_SIZE.

### VERIFY:AE-API-002 — Widget CRUD controller

The WidgetController provides CRUD endpoints nested under dashboards: `POST /dashboards/:dashboardId/widgets`, `GET /dashboards/:dashboardId/widgets`, `PATCH /widgets/:id`, `DELETE /widgets/:id`. Widget creation validates the widget type against the WidgetType enum and config structure.

### VERIFY:AE-API-003 — DataSource CRUD controller

The DataSourceController provides CRUD endpoints: `POST /data-sources`, `GET /data-sources`, `GET /data-sources/:id`, `PATCH /data-sources/:id`, `DELETE /data-sources/:id`. Includes sync trigger `POST /data-sources/:id/sync` and history `GET /data-sources/:id/sync-history`.

### VERIFY:AE-API-004 — DTO validation with class-validator

All DTOs use class-validator decorators: `@IsString()` + `@MaxLength()` on string fields, `@MaxLength(36)` on UUID fields, `@IsEmail()` + `@IsString()` + `@MaxLength()` on email fields. The global `ValidationPipe` is configured with `whitelist`, `forbidNonWhitelisted`, and `transform` options.

### VERIFY:AE-API-005 — Pagination clamping with shared constants

List endpoints use `clampPagination` from the shared package which clamps `page` to minimum 1 and `limit` to a range of 1–MAX_PAGE_SIZE (100). Invalid values are clamped, not rejected. DEFAULT_PAGE_SIZE (20) is used when no limit is provided.

### VERIFY:AE-API-006 — Cache-Control on list endpoints

All controller methods that return lists (`findAll` / list endpoints) set `Cache-Control` headers on the response. The header value is `public, max-age=60` for published data and `private, no-cache` for draft/tenant-specific data.

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
| GET | /dashboards/:did/widgets | JWT | List widgets |
| PATCH | /widgets/:id | JWT | Update widget |
| DELETE | /widgets/:id | JWT | Delete widget |
| GET | /data-sources | JWT | List data sources |
| POST | /data-sources | JWT | Create data source |
| GET | /data-sources/:id | JWT | Get data source |
| PATCH | /data-sources/:id | JWT | Update data source |
| DELETE | /data-sources/:id | JWT | Delete data source |
| POST | /data-sources/:id/sync | JWT | Trigger sync |
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |
| GET | /metrics | JWT | App metrics |
