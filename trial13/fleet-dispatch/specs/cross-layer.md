# Cross-Layer Integration Specification

## Overview

This document specifies cross-cutting concerns that span multiple layers of the
Fleet Dispatch application: request pipeline configuration, performance
optimizations, and end-to-end integration patterns.

## App Module Pipeline Configuration

<!-- VERIFY: FD-CROSS-001 -->
The `AppModule` configures the complete request processing pipeline via global
providers registered with `APP_GUARD`, `APP_FILTER`, and `APP_INTERCEPTOR`:

**Guards (APP_GUARD, executed in registration order):**
1. `ThrottlerGuard` — Rate limiting (short: 10/1s, long: 100/60s)
2. `JwtAuthGuard` — JWT validation with @Public() bypass
3. `RolesGuard` — RBAC enforcement with @Roles() metadata

**Filter (APP_FILTER):**
- `GlobalExceptionFilter` — Catches unhandled exceptions, logs with sanitized
  context, returns structured error responses with correlation IDs

**Interceptor (APP_INTERCEPTOR):**
- `ResponseTimeInterceptor` — Adds X-Response-Time header to all responses

**Middleware (configured in AppModule.configure()):**
- `CorrelationIdMiddleware` — Assigns/propagates correlation IDs
- `RequestLoggingMiddleware` — Logs request/response with structured format

The middleware executes before guards, which execute before interceptors.
This ensures correlation IDs are available throughout the entire pipeline.

## Pagination Performance

<!-- VERIFY: FD-PERF-001 -->
The `parsePagination()` function in the shared package enforces pagination limits:
- Parses `page` and `limit` from query parameters
- Clamps `limit` to `MAX_PAGE_SIZE` (100) to prevent unbounded queries
- Defaults to `DEFAULT_PAGE_SIZE` (20) when no limit is specified
- Calculates `skip` offset for Prisma queries

All list endpoints use this function to ensure consistent, bounded pagination
across the entire API surface.

## Response Time Tracking

<!-- VERIFY: FD-PERF-002 -->
The `ResponseTimeInterceptor` uses `perf_hooks.performance.now()` to measure
request processing duration with sub-millisecond precision. It adds an
`X-Response-Time` header (in milliseconds) to every response. This enables:
- Client-side performance monitoring
- Load balancer timeout tuning
- Performance regression detection in CI

The interceptor is registered globally via `APP_INTERCEPTOR` and runs on
every request including public endpoints.

## N+1 Query Prevention

<!-- VERIFY: FD-PERF-003 -->
The `DispatchService` uses Prisma `include` directives to eagerly load related
entities (vehicle, driver, route) in list and detail queries. This prevents
N+1 query patterns where fetching N dispatches would otherwise trigger N
additional queries for each related entity.

Example include pattern:
```
include: { vehicle: true, driver: true, route: true }
```

This reduces database round trips from O(N*3) to O(1) for dispatch list
queries, providing consistent performance regardless of result count.

## End-to-End Request Flow

A typical authenticated request flows through:
1. **CorrelationIdMiddleware**: Assigns correlation ID
2. **RequestLoggingMiddleware**: Logs incoming request
3. **ThrottlerGuard**: Checks rate limits
4. **JwtAuthGuard**: Validates JWT, extracts user payload
5. **RolesGuard**: Verifies user role matches endpoint requirements
6. **ResponseTimeInterceptor**: Starts performance timer
7. **Controller**: Extracts tenantId, delegates to service
8. **Service**: Executes Prisma query with tenant filter
9. **ResponseTimeInterceptor**: Adds X-Response-Time header
10. **RequestLoggingMiddleware**: Logs response (on finish)

If any step fails, the `GlobalExceptionFilter` catches the error and returns
a structured response with the correlation ID for debugging.

## Cross-References

- Guard configuration details: see [security.md](security.md) (FD-SEC-001 to FD-SEC-003)
- Monitoring middleware: see [monitoring.md](monitoring.md) (FD-MON-005, FD-MON-006)
- Exception filter: see [monitoring.md](monitoring.md) (FD-MON-004)
- Prisma includes on dispatch queries: see [data-model.md](data-model.md) (FD-DATA-003)
- Pagination constants from shared: see [authentication.md](authentication.md) (FD-AUTH-001)

## Integration Testing Strategy

Cross-layer integration tests verify the full pipeline by:
- Compiling the real `AppModule` with test overrides
- Making HTTP requests via supertest
- Asserting response headers (X-Response-Time, X-Correlation-Id)
- Verifying error response structure (correlationId, statusCode, message)
- Testing auth flow from login through protected endpoint access
- Checking that APP_VERSION from shared appears in health responses
