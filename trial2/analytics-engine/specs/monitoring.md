# Monitoring Specification

## Overview

The Analytics Engine implements comprehensive monitoring with structured JSON logging,
correlation ID tracking, health checks, metrics collection, and centralized error
handling. All monitoring infrastructure uses NestJS dependency injection.

## Monitoring Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Application health status |
| GET | /health/ready | Public | Database readiness check |
| GET | /metrics | Public | Request/error counts and response times |

All monitoring endpoints are exempt from both authentication (@Public()) and
rate limiting (@SkipThrottle()).

## Requirements

<!-- VERIFY:AE-MON-001 — Monitoring controller with @Public() and @SkipThrottle() -->
- REQ-MON-001: Health and metrics endpoints must be public and skip throttling

<!-- VERIFY:AE-MON-002 — Health endpoint returns APP_VERSION, readiness uses $queryRaw -->
- REQ-MON-002: GET /health must return status, timestamp, uptime, and version (APP_VERSION)
- GET /health/ready must use $queryRaw to verify database connectivity

<!-- VERIFY:AE-MON-003 — Pino structured JSON logger (DI-injectable) -->
- REQ-MON-003: Logger must be Pino-based, DI-injectable, and produce structured JSON
- No console.log in production API code

<!-- VERIFY:AE-MON-004 — RequestContextService is request-scoped with correlationId -->
- REQ-MON-004: RequestContextService must be request-scoped
- Must track correlationId, userId, and tenantId

<!-- VERIFY:AE-MON-005 — CorrelationIdMiddleware preserves or generates correlation ID -->
- REQ-MON-005: CorrelationIdMiddleware must:
  - Preserve client-provided X-Correlation-ID header
  - Generate UUID via createCorrelationId from shared if not provided
  - Set X-Correlation-ID response header

<!-- VERIFY:AE-MON-006 — RequestLoggingMiddleware logs with formatLogEntry from shared -->
- REQ-MON-006: RequestLoggingMiddleware must log method, URL, status code, duration,
  and correlationId using formatLogEntry from shared package

<!-- VERIFY:AE-MON-007 — GlobalExceptionFilter as APP_FILTER with sanitized errors -->
- REQ-MON-007: GlobalExceptionFilter must:
  - Be registered as APP_FILTER in AppModule
  - Sanitize request body via sanitizeLogContext from shared
  - Include correlationId in error response body
  - Never expose stack traces to clients

## Health Endpoint Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0"
}
```

## Readiness Endpoint Response

```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Metrics Endpoint Response

```json
{
  "requestCount": 150,
  "errorCount": 3,
  "averageResponseTime": 42,
  "uptime": 3600
}
```

## Log Sanitization

The sanitizeLogContext function from shared redacts sensitive keys:
- password, passwordHash, token, accessToken, secret
- authorization, refreshToken, apiKey, configEncrypted
- Case-insensitive matching
- Deep nested object traversal
- Array recursion support (see [cross-layer.md](cross-layer.md))

## Performance Integration

See [api-endpoints.md](api-endpoints.md) for pagination requirements.

<!-- VERIFY:AE-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR using performance.now() -->
- REQ-PERF-001: ResponseTimeInterceptor must use performance.now() from perf_hooks
- Must set X-Response-Time header on all responses

<!-- VERIFY:AE-PERF-002 — Pagination clamping with shared clampPagination utility -->
- REQ-PERF-002: Pagination must clamp (not reject) values using clampPagination from shared
