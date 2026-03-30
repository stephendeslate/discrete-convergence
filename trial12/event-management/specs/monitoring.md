# Monitoring Specification

## Overview

The Event Management API implements comprehensive observability through correlation IDs, structured logging, request context tracking, and health/readiness endpoints. All monitoring endpoints are publicly accessible without authentication.

See also: [Security](security.md) for guard configuration, [API Endpoints](api-endpoints.md) for endpoint details.

## Correlation and Tracing

VERIFY: EM-MON-001
createCorrelationId() generates a unique identifier per request using crypto.randomUUID(). Exported from the shared package.

VERIFY: EM-MON-002
LogEntry interface defines the structured log format: timestamp, level, message, correlationId, method, url, statusCode, duration, context.

VERIFY: EM-MON-003
formatLogEntry() produces a JSON-formatted log string from a LogEntry. Includes all observability fields for log aggregation.

## Log Sanitization

VERIFY: EM-MON-004
sanitizeLogContext() recursively redacts sensitive fields from log payloads. Handles nested objects, arrays, and performs case-insensitive key matching against SENSITIVE_KEYS.

## Exception Handling

VERIFY: EM-MON-005
GlobalExceptionFilter (APP_FILTER) catches all exceptions. Returns structured error responses with correlationId. Uses sanitizeLogContext() to prevent sensitive data leakage in error logs. Differentiates HttpException vs unknown errors.

## Request Pipeline

VERIFY: EM-MON-006
CorrelationIdMiddleware generates a correlation ID for each request using createCorrelationId(), stores it in RequestContextService, and sets the X-Correlation-Id response header.

VERIFY: EM-MON-007
RequestContextService is request-scoped (Scope.REQUEST). Holds correlationId and tenantId for the current request lifecycle. Injected into filters, interceptors, and controllers.

VERIFY: EM-MON-008
RequestLoggingMiddleware logs each request using formatLogEntry() from the shared package. Captures method, URL, and attaches correlation ID from RequestContextService.

## Health and Readiness

VERIFY: EM-MON-009
MonitoringController exposes /monitoring/health and /monitoring/readiness. ALL methods are decorated with @Public() — no authentication required. Health endpoint uses @SkipThrottle() to avoid rate limiting on health checks.

VERIFY: EM-MON-010
MonitoringService implements health check (returns status + APP_VERSION from shared) and readiness check (executes SELECT 1 via Prisma $queryRaw to verify database connectivity). Returns isReady boolean.

VERIFY: EM-MON-011
Monitoring integration tests verify health endpoint returns 200 with version, readiness endpoint reflects database state, and all monitoring endpoints are accessible without authentication.

## Performance Tracking

VERIFY: EM-PERF-001
clampPageSize() constrains page size to valid bounds (1..MAX_PAGE_SIZE) to prevent excessive query results.

VERIFY: EM-PERF-002
calculateSkip() computes the Prisma skip offset from page number and page size for efficient pagination.

VERIFY: EM-PERF-003
ResponseTimeInterceptor (APP_INTERCEPTOR) measures request duration using performance.now() from perf_hooks. Sets X-Response-Time header on every response.

VERIFY: EM-PERF-004
Performance integration tests verify response time header is present, pagination utilities clamp correctly, and API responses complete within acceptable thresholds.
