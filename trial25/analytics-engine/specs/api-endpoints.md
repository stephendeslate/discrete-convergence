# API Endpoints Specification

## Overview

The Analytics Engine API is built with NestJS 11, using controllers with
guards, pipes, and interceptors for cross-cutting concerns.

## Base Configuration

- Port: process.env.PORT ?? '3001'
- Global ValidationPipe with forbidNonWhitelisted: true, whitelist: true, transform: true
- Global ThrottlerGuard (APP_GUARD) with limit >= 20000
- Global CorrelationInterceptor (APP_INTERCEPTOR)
- Global ResponseTimeInterceptor (APP_INTERCEPTOR)
- Global ExceptionFilter (APP_FILTER)
- Helmet with CSP directives
- CORS enabled

<!-- VERIFY:API-GLOBAL-PROVIDERS — APP_GUARD, APP_FILTER, APP_INTERCEPTOR registered -->
<!-- VERIFY:API-VALIDATION-PIPE — ValidationPipe with forbidNonWhitelisted -->

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login and get tokens |
| POST | /auth/refresh | No | Refresh access token |

## Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboards | JWT + Tenant | List dashboards (paginated) |
| GET | /dashboards/:id | JWT + Tenant | Get single dashboard |
| POST | /dashboards | JWT + Tenant | Create dashboard |
| PATCH | /dashboards/:id | JWT + Tenant | Update dashboard |
| DELETE | /dashboards/:id | JWT + Tenant | Delete dashboard |
| GET | /dashboards/:id/data | JWT + Tenant | Get dashboard with data |

<!-- VERIFY:API-DASHBOARD-CRUD — Dashboard endpoints support full CRUD -->

## Widget Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /widgets | JWT + Tenant | List widgets (paginated) |
| GET | /widgets/:id | JWT + Tenant | Get single widget |
| POST | /widgets | JWT + Tenant | Create widget |
| PATCH | /widgets/:id | JWT + Tenant | Update widget |
| DELETE | /widgets/:id | JWT + Tenant | Delete widget |
| GET | /widgets/:id/data | JWT + Tenant | Get widget data |

<!-- VERIFY:API-WIDGET-CRUD — Widget endpoints support full CRUD plus data -->

## Data Source Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /data-sources | JWT + Tenant | List data sources |
| GET | /data-sources/:id | JWT + Tenant | Get single data source |
| POST | /data-sources | JWT + Tenant | Create data source |
| PATCH | /data-sources/:id | JWT + Tenant | Update data source |
| DELETE | /data-sources/:id | JWT + Tenant | Delete data source |
| POST | /data-sources/:id/sync | JWT + Tenant | Trigger sync |
| POST | /data-sources/:id/test-connection | JWT + Tenant | Test connection |

<!-- VERIFY:API-DATASOURCE-CRUD — DataSource endpoints include sync and test -->

## Sync History Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /sync-history | JWT + Tenant | List sync records |
| GET | /sync-history/:id | JWT + Tenant | Get single sync record |

## Audit Log Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /audit-logs | JWT + Tenant | List audit logs |

## Monitoring Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| GET | /health/ready | No | Readiness check (includes DB) |
| GET | /health/metrics | No | System metrics |
| GET | /metrics | No | Alias to /health/metrics |

<!-- VERIFY:API-HEALTH-ENDPOINTS — /health and /health/ready exist at correct paths -->

## Guards

- **AuthGuard('jwt')**: Validates JWT token via passport-jwt
- **TenantGuard**: Ensures user.tenantId exists and sets tenant context

## Pagination

All list endpoints accept page and limit query parameters.
Pagination is handled by clampPagination() from @repo/shared.
Responses include: data, total, page, limit, totalPages.

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "correlationId": "uuid-v4"
}
```

## Implementation Traceability

<!-- VERIFY:AE-APP-001 — Root application module -->
<!-- VERIFY:AE-ENV-001 — Environment variable validation -->
<!-- VERIFY:AE-ERR-001 — Global exception filter -->
<!-- VERIFY:AE-GUARD-001 — TenantGuard implementation -->
<!-- VERIFY:AE-INFRA-001 — Prisma service with tenant context -->
<!-- VERIFY:AE-INFRA-002 — Tenant context via RLS -->
<!-- VERIFY:AE-INFRA-003 — Tenant-scoped transaction -->
<!-- VERIFY:AE-INFRA-004 — Prisma module exports -->
<!-- VERIFY:AE-LOG-001 — Structured logging with pino -->
<!-- VERIFY:AE-PAG-001 — Paginated query DTO -->
<!-- VERIFY:AE-PAG-003 — Pagination skip/take utility -->
<!-- VERIFY:AE-PAG-004 — Pagination response builder -->
<!-- VERIFY:AE-PERF-001 — Performance configuration -->
<!-- VERIFY:AE-RBAC-001 — Roles decorator -->
<!-- VERIFY:AE-RBAC-002 — Roles guard implementation -->
<!-- VERIFY:MAIN-BOOTSTRAP — NestJS application entry point -->
<!-- VERIFY:EXC-FILTER — Exception filter implementation -->
<!-- VERIFY:EXC-FILTER-TEST — Exception filter unit tests -->
<!-- VERIFY:PAG-QUERY — Paginated query DTO -->
<!-- VERIFY:PAG-UTILS — Pagination utilities -->
<!-- VERIFY:PAG-UTILS-TEST — Pagination utilities tests -->
<!-- VERIFY:RBAC-DECORATOR — Roles decorator -->
<!-- VERIFY:RBAC-GUARD — Roles guard -->
<!-- VERIFY:RBAC-GUARD-TEST — Roles guard unit tests -->
<!-- VERIFY:TENANT-GUARD — TenantGuard implementation -->
<!-- VERIFY:TENANT-GUARD-TEST — TenantGuard unit tests -->
<!-- VERIFY:TEST-ENV-SETUP — Test environment setup -->
<!-- VERIFY:TEST-MOCK-PRISMA — Mock Prisma for tests -->
<!-- VERIFY:TEST-UTILS — Test utility functions -->
