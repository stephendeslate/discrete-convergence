# Cross-Layer Integration Specification

## Overview

This specification defines how all architectural layers of the Analytics Engine
work together. It covers the global provider chain, middleware ordering,
cumulative regression requirements, and end-to-end verification.

## Global Provider Chain

All global providers are registered in AppModule via NestJS dependency injection.
No providers are registered in main.ts using app.useGlobal* methods.

### APP_GUARD

Two guards registered as APP_GUARD:
1. ThrottlerGuard — Rate limiting enforcement
2. JwtAuthGuard — Authentication enforcement with @Public() exemption

### APP_FILTER

GlobalExceptionFilter — Sanitized error responses with correlation ID.
See [monitoring.md](monitoring.md) for filter implementation details.

### APP_INTERCEPTOR

ResponseTimeInterceptor — X-Response-Time header on all responses.

- VERIFY:AE-ARCH-001 — AppModule registers APP_GUARD (ThrottlerGuard +
  JwtAuthGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR
  (ResponseTimeInterceptor) via NestJS DI

## Middleware Ordering

Middleware is applied in AppModule.configure():
1. CorrelationIdMiddleware — Sets/preserves correlation ID
2. RequestLoggingMiddleware — Logs request with correlation ID

This ordering ensures the correlation ID is available for request logging.

## Domain Controller Pattern

Domain controllers (Dashboard, Widget, DataSource) do NOT use
`@UseGuards(JwtAuthGuard)` on individual controllers or methods.
Authentication is enforced by the global APP_GUARD.
See [authentication.md](authentication.md) for guard implementation.

## Cross-Layer Integration Test

The cross-layer integration test verifies the full pipeline:
1. Authentication — Register and login
2. CRUD operations — Create, read, update, delete
3. Error handling — Sanitized errors with correlation ID
4. Correlation IDs — Client ID preserved through pipeline
5. Response time — X-Response-Time header present
6. Health check — Status, version from APP_VERSION
7. Database — $queryRaw connectivity check

- VERIFY:AE-CROSS-001 — Cross-layer test verifies auth, CRUD, error handling,
  correlation IDs, response time, health, and DB check

## Shared Package Consumption

The shared package is consumed by >= 3 files in each app:
- apps/api: auth.service.ts, dashboard.service.ts, data-source.service.ts,
  main.ts, monitoring.controller.ts, correlation-id.middleware.ts,
  request-logging.middleware.ts, global-exception.filter.ts, seed.ts
- apps/web: actions.ts, page.tsx, utils.ts
See [security.md](security.md) for convention enforcement details.

## Cumulative Verification

All L0-L8 checks must pass simultaneously:
- L0: DTOs validated, services scope by tenant
- L1: Integration tests compile real AppModule
- L2: All routes have loading.tsx and error.tsx
- L3: VERIFY/TRACED parity at 100%
- L4: Dockerfile, CI, seed all present and valid
- L5: Monorepo builds with turbo
- L6: Helmet, Throttler, CORS, ValidationPipe configured
- L7: Pagination, Cache-Control, ResponseTime present
- L8: Pino, correlation IDs, health endpoints working

## Version Consistency

APP_VERSION from shared is used in:
- GET /health endpoint response
- apps/web home page
- CLAUDE.md project documentation

This ensures version consistency across all layers.
See [authentication.md](authentication.md) and [monitoring.md](monitoring.md).
