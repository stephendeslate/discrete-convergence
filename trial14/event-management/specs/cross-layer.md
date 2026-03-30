# Cross-Layer Integration Specification

## Overview

The event management platform relies on cross-cutting concerns that span multiple layers:
shared constants and types consumed by both API and web packages, pagination utilities
used across all domain services, performance instrumentation applied globally, and the
module composition that wires guards, filters, and interceptors together. This spec
verifies the contracts that bridge these layers.

## Shared Package Exports

The packages/shared module serves as the single source of truth for constants, types,
utilities, and monitoring helpers. Both the API and web packages import from @event-management/shared.

- VERIFY: EM-SHARED-001 — constants.ts exports APP_VERSION, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, SENSITIVE_KEYS
- VERIFY: EM-SHARED-002 — index.ts re-exports all shared modules (constants, types, correlation, log-format, log-sanitizer, env-validation, pagination)

## Pagination Pipeline

Pagination is enforced at three levels: shared utility clamps values, DTOs validate input
with class-validator, and services apply clamped values to Prisma queries. This prevents
unbounded queries and ensures consistent page sizes across all domain endpoints.

- VERIFY: EM-PERF-001 — MAX_PAGE_SIZE constant limits maximum items per page to 100
- VERIFY: EM-PERF-002 — DEFAULT_PAGE_SIZE constant provides default of 20 items per page
- VERIFY: EM-PERF-003 — clampPagination enforces page >= 1 constraint
- VERIFY: EM-PERF-004 — clampPagination enforces pageSize between 1 and MAX_PAGE_SIZE

## Performance Instrumentation

ResponseTimeInterceptor measures request duration using performance.now() and attaches
the result as an X-Response-Time header on every response. This feeds into the /metrics
endpoint for aggregate performance tracking.

- VERIFY: EM-PERF-005 — ResponseTimeInterceptor uses performance.now() and sets X-Response-Time header

## Module Composition

AppModule wires the full NestJS dependency injection graph. It registers ThrottlerModule
with named rate-limit configurations, three global APP_GUARDs (ThrottlerGuard, JwtAuthGuard,
RolesGuard), one APP_FILTER (GlobalExceptionFilter), one APP_INTERCEPTOR
(ResponseTimeInterceptor), and applies CorrelationIdMiddleware and RequestLoggingMiddleware
to all routes. This composition is the integration point where all cross-cutting concerns
converge.

- VERIFY: EM-CROSS-001 — AppModule registers ThrottlerGuard, JwtAuthGuard, RolesGuard as APP_GUARD; GlobalExceptionFilter as APP_FILTER; ResponseTimeInterceptor as APP_INTERCEPTOR

## Verification Strategy

Cross-layer tests in `apps/api/test/cross-layer.integration.spec.ts` exercise the full
request pipeline from HTTP entry through middleware, guards, interceptors, controllers,
services, and back through the filter and interceptor on response. These tests verify:

1. Correlation ID propagation through the entire request lifecycle
2. Rate limiting applied before authentication checks
3. Role-based access control after JWT validation
4. Response time header present on all responses
5. Error sanitization in exception filter responses
6. Pagination clamping applied consistently across endpoints

## Cross-References

- See [authentication.md](authentication.md) for JWT guard and auth flow details
- See [security.md](security.md) for guard ordering and exception filter behavior
- See [monitoring.md](monitoring.md) for correlation ID middleware and logging pipeline
- See [api-endpoints.md](api-endpoints.md) for domain controller pagination usage
- See [infrastructure.md](infrastructure.md) for environment validation at startup
