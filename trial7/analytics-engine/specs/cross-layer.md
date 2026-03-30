# Cross-Layer Integration Specification

## Overview

This specification defines the cross-layer integration requirements that verify
all layers (L0-L9) work together correctly. The integration pipeline ensures
auth, CRUD, error handling, correlation IDs, response time, and monitoring
all function as a cohesive system.

## Architecture Integration

- VERIFY: AE-ARCH-001 — AppModule registers ThrottlerGuard, JwtAuthGuard, RolesGuard as APP_GUARD, GlobalExceptionFilter as APP_FILTER, ResponseTimeInterceptor as APP_INTERCEPTOR

### Global Provider Chain
AppModule providers register via NestJS DI:
- APP_GUARD: ThrottlerGuard (rate limiting)
- APP_GUARD: JwtAuthGuard (authentication)
- APP_GUARD: RolesGuard (authorization)
- APP_FILTER: GlobalExceptionFilter (error handling)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance)

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on global guard.
@Public() decorator exempts specific routes (health, auth, metrics).

## Performance Integration

- VERIFY: AE-PERF-001 — ResponseTimeInterceptor sets X-Response-Time header using performance.now()
- VERIFY: AE-PERF-002 — Pagination utility clamps page size to MAX_PAGE_SIZE from shared

### Response Time
ResponseTimeInterceptor measures elapsed time via performance.now() from perf_hooks
and sets X-Response-Time header on every response.

### Pagination
All list endpoints use getPagination() which delegates to clampPagination() from shared.
Page size clamped to [1, MAX_PAGE_SIZE=100], defaulting to DEFAULT_PAGE_SIZE=20.

## Accessibility Integration

- VERIFY: AE-AX-001 — Jest-axe tests verify real UI components have no accessibility violations
- VERIFY: AE-AX-002 — Keyboard navigation tests verify tab, enter, and space interactions

## Test Coverage

- VERIFY: AE-TEST-001 — Mock Prisma helper provides typed jest.fn() mocks for all models
- VERIFY: AE-TEST-002 — Auth service unit tests cover register, login, and validation
- VERIFY: AE-TEST-003 — Dashboard service unit tests cover CRUD, pagination, and not-found errors
- VERIFY: AE-TEST-004 — DataSource service unit tests cover CRUD and raw query execution
- VERIFY: AE-TEST-005 — Auth integration tests use supertest with real AppModule compilation
- VERIFY: AE-TEST-006 — Dashboard integration tests verify CRUD, auth, pagination, and RBAC
- VERIFY: AE-TEST-007 — Monitoring integration tests verify health, readiness, metrics via supertest
- VERIFY: AE-TEST-008 — Security integration tests verify auth enforcement, token validation, error sanitization
- VERIFY: AE-TEST-009 — Performance integration tests verify response time, Cache-Control, pagination clamping
- VERIFY: AE-TEST-010 — Cross-layer integration test verifies full pipeline from auth to health

## Full Pipeline Test

The cross-layer integration test verifies:
1. Authentication: 401 without token, successful with valid token
2. CRUD: Create and list dashboards with pagination
3. Error handling: 404 responses include correlationId, no stack traces
4. Response time: X-Response-Time header present on all responses
5. Health: /health returns APP_VERSION from shared, /health/ready checks DB
6. RBAC: 403 when USER tries ADMIN-only delete
7. Validation: 400 for invalid DTOs

## Shared Package Integration

Both apps import from @analytics-engine/shared:
- apps/api: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, createCorrelationId,
  formatLogEntry, sanitizeLogContext, validateEnvVars, clampPagination, Role
- apps/web: APP_VERSION, validateEnvVars, cn utility

Zero dead exports — every named export has at least one consumer.
