# Cross-Layer Integration Specification

## Overview
Verifies that all application layers work together correctly:
global guards, interceptors, filters, shared package integration.

## Global Providers (AppModule)
- APP_GUARD: ThrottlerGuard, JwtAuthGuard, RolesGuard
- APP_FILTER: GlobalExceptionFilter
- APP_INTERCEPTOR: ResponseTimeInterceptor
- Domain controllers do NOT use @UseGuards(JwtAuthGuard) directly

## Full Pipeline
- Request -> CorrelationIdMiddleware -> RequestLoggingMiddleware
- -> ThrottlerGuard -> JwtAuthGuard -> RolesGuard
- -> Controller -> Service -> Prisma
- -> ResponseTimeInterceptor -> Response

## VERIFY Tags
- VERIFY: FD-XL-001 - Auth enforced globally without controller @UseGuards
- VERIFY: FD-XL-002 - Full pipeline: auth + role + response time
- VERIFY: FD-XL-003 - APP_VERSION from shared in health endpoint
- VERIFY: FD-XL-004 - RBAC via global RolesGuard
- VERIFY: FD-XL-005 - Correlation ID preserved across stack
- VERIFY: FD-XL-006 - X-Response-Time on health endpoint

## Shared Package Usage
- API imports: BCRYPT_SALT_ROUNDS, APP_VERSION, createCorrelationId, formatLogEntry,
  sanitizeLogContext, validateEnvVars, ALLOWED_REGISTRATION_ROLES, clampPagination
- Web imports: APP_VERSION, sanitizeLogContext, clampPagination (via actions)

## Performance
- VERIFY: FD-PERF-002 - Cache-Control on list endpoints
- VERIFY: FD-PERF-003 - Page size clamped to MAX_PAGE_SIZE
- VERIFY: FD-PERF-004 - DEFAULT_PAGE_SIZE used when unspecified
- VERIFY: FD-PERF-005 - Negative page clamped to 1

## Driver Service Integration
- VERIFY: FD-DRV-003 - NotFoundException for non-existent driver
- VERIFY: FD-DRV-005 - NotFoundException when updating non-existent driver
- VERIFY: FD-DRV-006 - Delete driver with tenant scope
- VERIFY: FD-DRV-007 - NotFoundException when deleting non-existent driver

## Middleware Chain
- CorrelationIdMiddleware runs first, sets x-correlation-id on both request and response
- If client sends x-correlation-id, the server preserves it (pass-through)
- If no correlation ID present, generates one via createCorrelationId from shared
- RequestLoggingMiddleware logs method, url, and correlation ID via formatLogEntry

## Exception Handling
- GlobalExceptionFilter catches all exceptions
- Logs stack trace and request context via sanitizeLogContext
- Returns standardized error shape: { statusCode, message, correlationId }
- Sensitive fields (password, token, secret) are redacted before logging

## Response Headers
- X-Response-Time: measured via performance.now() in ResponseTimeInterceptor
- Cache-Control: private, max-age=30 on list endpoints
- x-correlation-id: echoed back to caller for distributed tracing
