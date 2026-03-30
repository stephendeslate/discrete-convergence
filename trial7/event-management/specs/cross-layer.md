# Cross-Layer Integration Specification

## Overview

This specification verifies that all layers (L0-L9) work together correctly.
The cross-layer integration test validates the full pipeline from authentication
through CRUD operations, error handling, correlation IDs, response timing,
health checks, and database connectivity.

See also: [authentication.md](authentication.md) for auth flow.
See also: [monitoring.md](monitoring.md) for health and metrics.
See also: [security.md](security.md) for guards and validation.

## AppModule Architecture

- VERIFY: EM-ARCH-001 — AppModule registers all global providers via DI:
  ThrottlerGuard + JwtAuthGuard + RolesGuard as APP_GUARD,
  GlobalExceptionFilter as APP_FILTER,
  ResponseTimeInterceptor as APP_INTERCEPTOR;
  applies CorrelationIdMiddleware and RequestLoggingMiddleware to all routes

## Performance: Response Time

- VERIFY: EM-PERF-001 — ResponseTimeInterceptor measures request duration using
  performance.now() from perf_hooks, sets X-Response-Time header on all responses

## Performance: Pagination DTO

- VERIFY: EM-PERF-002 — PaginatedQueryDto validates optional page and pageSize
  query parameters with @IsString, @MaxLength, @IsOptional

## Performance: Pagination Implementation

- VERIFY: EM-PERF-003 — Event findAll uses clampPagination from shared to bound
  page size to MAX_PAGE_SIZE (100), default DEFAULT_PAGE_SIZE (20)

## Performance: Cache-Control

- VERIFY: EM-PERF-004 — EventController.findAll sets Cache-Control: private, max-age=30
  header on list responses via @Res({ passthrough: true })

## Performance: APP_INTERCEPTOR

- VERIFY: EM-PERF-005 — ResponseTimeInterceptor registered as APP_INTERCEPTOR in
  AppModule providers (not main.ts)

## Integration Test Coverage

The cross-layer integration test (cross-layer.integration.spec.ts) verifies:

1. **Auth enforcement:** Protected routes return 401 without token
2. **Auth + CRUD flow:** Valid token allows access to event listing
3. **Response timing:** X-Response-Time header present on all responses
4. **Health endpoint:** Returns APP_VERSION from shared package
5. **DB connectivity:** /health/ready confirms database connection
6. **Error correlation:** 404 errors include correlationId in response body
7. **Correlation preservation:** Client-provided X-Correlation-ID is preserved

## Guard Chain

The global guard chain processes in order:
1. ThrottlerGuard — rate limiting check
2. JwtAuthGuard — authentication (skips if @Public())
3. RolesGuard — authorization (skips if no @Roles())

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on global guard.

## Shared Package Utilization

The @event-management/shared package is imported by >= 3 files in each app:

### apps/api imports:
- BCRYPT_SALT_ROUNDS (auth.service, seed)
- ALLOWED_REGISTRATION_ROLES (auth.dto)
- clampPagination (event.service, ticket.service, venue.service, etc.)
- createCorrelationId (correlation-id.middleware)
- formatLogEntry (request-logging.middleware)
- sanitizeLogContext (global-exception.filter)
- validateEnvVars (main.ts)
- APP_VERSION (monitoring.controller)

### apps/web imports:
- APP_VERSION (lib/actions)
- validateEnvVars (lib/actions)
- cn utility depends on clsx + tailwind-merge (lib/utils)
