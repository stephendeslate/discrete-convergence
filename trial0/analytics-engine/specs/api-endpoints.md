# API Endpoints Specification

## Overview

RESTful API built on NestJS 11 with global guards, filters, and interceptors
registered via DI in AppModule. All endpoints require JWT unless decorated with @Public().

## Application Bootstrap

- VERIFY:AE-MAIN-001 — Bootstrap validates env vars, configures Helmet, CORS, ValidationPipe
- VERIFY:AE-APP-001 — Root module registers APP_GUARD, APP_FILTER, APP_INTERCEPTOR via DI
- VERIFY:AE-GUARD-001 — ThrottlerGuard as first APP_GUARD
- VERIFY:AE-SEC-004 — ThrottlerModule with named configs: default (100/60s), auth (5/60s)

## Auth Routes

| Method | Path | Public | Description |
|--------|------|--------|-------------|
| POST | /auth/register | Yes | Create account |
| POST | /auth/login | Yes | Get JWT tokens |
| POST | /auth/refresh | No | Refresh access token |

## Dashboard Routes

- VERIFY:AE-DASH-004 — Dashboard controller with full CRUD + publish + archive
- VERIFY:AE-PERF-004 — Cache-Control: public, max-age=60 on GET /dashboards

| Method | Path | Description |
|--------|------|-------------|
| POST | /dashboards | Create dashboard |
| GET | /dashboards | List with pagination |
| GET | /dashboards/:id | Get by ID |
| PATCH | /dashboards/:id | Update |
| DELETE | /dashboards/:id | Soft delete |
| POST | /dashboards/:id/publish | DRAFT → PUBLISHED |
| POST | /dashboards/:id/archive | PUBLISHED → ARCHIVED |

## Data Source Routes

- VERIFY:AE-DS-003 — DataSource controller with CRUD + sync trigger

| Method | Path | Description |
|--------|------|-------------|
| POST | /data-sources | Create data source |
| GET | /data-sources | List with pagination |
| GET | /data-sources/:id | Get by ID |
| PATCH | /data-sources/:id | Update |
| DELETE | /data-sources/:id | Delete |
| POST | /data-sources/:id/sync | Trigger sync |
| GET | /data-sources/:id/sync-history | Get sync runs |

## Widget Routes

- VERIFY:AE-WID-001 — Widget service with CRUD and position management

| Method | Path | Description |
|--------|------|-------------|
| POST | /widgets | Create widget |
| GET | /widgets | List by dashboard |
| GET | /widgets/:id | Get by ID |
| PATCH | /widgets/:id | Update |
| DELETE | /widgets/:id | Delete |
| PATCH | /widgets/:id/position | Update position |

## Embed Routes

- VERIFY:AE-EMBED-001 — Embed config CRUD for dashboard embedding

| Method | Path | Description |
|--------|------|-------------|
| GET | /embed/:dashboardId | Get embed config (Public) |
| POST | /embed | Create or update config |

## API Key Routes

- VERIFY:AE-KEY-001 — API key with hash storage, prefix display

| Method | Path | Description |
|--------|------|-------------|
| POST | /api-keys | Create API key |
| GET | /api-keys | List user's keys |
| DELETE | /api-keys/:id | Revoke key |

## Audit Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /audit | List audit entries (paginated) |

## Pagination

- VERIFY:AE-PAG-001 — Pagination clamping: values above MAX_PAGE_SIZE clamped, not rejected
- VERIFY:AE-PERF-003 — All list endpoints support page/limit query params
- Default page size: 20, max: 100 (from shared constants)

## Validation

- VERIFY:AE-SEC-003 — ValidationPipe with whitelist + forbidNonWhitelisted + transform
- All DTOs use class-validator decorators
- Extra fields stripped (whitelist), unknown fields rejected (forbidNonWhitelisted)

## Cross-References

- See [authentication.md](authentication.md) for JWT guard chain
- See [security.md](security.md) for rate limiting and input validation
- See [data-model.md](data-model.md) for entity schemas
- See [monitoring.md](monitoring.md) for monitoring endpoints

## Test Coverage

- VERIFY:AE-TEST-002 — Dashboard integration tests: CRUD, pagination, Cache-Control, publish
- VERIFY:AE-TEST-003 — Cross-layer integration test: response time, health, correlation, auth flow
