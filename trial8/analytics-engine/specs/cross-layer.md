# Cross-Layer Integration Specification

> **Project:** Analytics Engine
> **Category:** CROSS
> **Related:** See [authentication.md](authentication.md), [monitoring.md](monitoring.md), [security.md](security.md)

---

## Overview

The analytics engine integrates multiple layers through global NestJS providers, shared package exports, and traceability tags. This specification covers the integration points that span multiple architectural layers.

---

## Requirements

### VERIFY:AE-CROSS-001 — Global provider chain

The `AppModule` registers a three-tiered global provider chain via `APP_GUARD`, `APP_FILTER`, and `APP_INTERCEPTOR`:
- `APP_GUARD`: `ThrottlerGuard` (rate limiting), `JwtAuthGuard` (authentication), `RolesGuard` (authorization)
- `APP_FILTER`: `GlobalExceptionFilter` (error handling with correlation IDs)
- `APP_INTERCEPTOR`: `ResponseTimeInterceptor` (performance measurement)

Middleware (`CorrelationIdMiddleware`, `RequestLoggingMiddleware`) is applied via `NestModule.configure()` on all routes.

### VERIFY:AE-CROSS-002 — Shared package exports

The shared package (`@analytics-engine/shared`) exports exactly 10 consumed symbols: `BCRYPT_SALT_ROUNDS`, `ALLOWED_REGISTRATION_ROLES`, `APP_VERSION`, `MAX_PAGE_SIZE`, `DEFAULT_PAGE_SIZE`, `clampPagination`, `createCorrelationId`, `formatLogEntry`, `sanitizeLogContext`, `validateEnvVars`. All exports are consumed by at least one file in `apps/api` or `apps/web`.

### VERIFY:AE-CROSS-003 — Integration test coverage

Cross-layer integration tests verify the full request pipeline: public endpoint accessibility, JWT protection on private routes, correlation ID propagation, response time headers, error response format with correlationId, and validation pipe behavior. Tests use supertest against the compiled NestJS app.

### VERIFY:AE-CROSS-004 — VERIFY/TRACED tag parity

Every VERIFY tag in spec files has exactly one matching TRACED tag in `.ts` or `.tsx` source files. TRACED tags appear only in TypeScript source files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or configuration files. The tag inventory has at least 35 unique tags with at most 2 orphans.

---

## Provider Registration Order

The provider chain executes in registration order:
1. Middleware: CorrelationIdMiddleware, RequestLoggingMiddleware
2. Guards: ThrottlerGuard, JwtAuthGuard, RolesGuard
3. Interceptors: ResponseTimeInterceptor (wraps controller execution)
4. Filters: GlobalExceptionFilter (catches thrown exceptions)

---

## Shared Package Consumption

| Export | Consumed By |
|--------|------------|
| BCRYPT_SALT_ROUNDS | auth.service.ts, seed.ts |
| ALLOWED_REGISTRATION_ROLES | register.dto.ts |
| APP_VERSION | monitoring.controller.ts, layout.tsx |
| MAX_PAGE_SIZE | paginated-query.ts (via clampPagination) |
| DEFAULT_PAGE_SIZE | paginated-query.ts (via clampPagination) |
| clampPagination | paginated-query.ts |
| createCorrelationId | correlation-id.middleware.ts |
| formatLogEntry | request-logging.middleware.ts |
| sanitizeLogContext | global-exception.filter.ts |
| validateEnvVars | main.ts |
