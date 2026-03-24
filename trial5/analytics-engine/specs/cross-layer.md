# Cross-Layer Specification

## Overview

This spec covers integration points between layers: the shared package,
module wiring, and cross-cutting concerns.

## Shared Package

<!-- VERIFY: AE-CROSS-002 -->
- Published as `@analytics-engine/shared` via workspace:* protocol
- Exports: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, clampPagination
- Exports: createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars
- Consumed by both API and Web apps

## Module Wiring

<!-- VERIFY: AE-CROSS-001 -->
- AppModule imports: AuthModule, DashboardModule, DataSourceModule, WidgetModule, MonitoringModule
- Global providers via APP_GUARD: JwtAuthGuard, RolesGuard, ThrottlerGuard
- Global filter via APP_FILTER: GlobalExceptionFilter
- Global interceptor via APP_INTERCEPTOR: ResponseTimeInterceptor
- Middleware chain: CorrelationIdMiddleware -> RequestLoggingMiddleware

## Request Lifecycle

1. Request arrives
2. CorrelationIdMiddleware assigns/preserves correlation ID
3. RequestLoggingMiddleware captures start time
4. ThrottlerGuard checks rate limit
5. JwtAuthGuard validates JWT (unless @Public())
6. RolesGuard checks role (unless no @Roles() specified)
7. ValidationPipe validates request body
8. Controller handler executes
9. ResponseTimeInterceptor adds X-Response-Time header
10. RequestLoggingMiddleware logs completed request

## Error Flow

1. Exception thrown in handler
2. GlobalExceptionFilter catches it
3. Sanitizes request body for logging
4. Logs error with correlation ID
5. Returns sanitized error response with correlation ID

## Pagination Integration

- Shared `clampPagination` enforces bounds (page >= 1, 1 <= limit <= 100)
- API `parsePaginationParams` converts string query params to numbers
- `paginatedQuery` utility executes findMany + count in parallel
