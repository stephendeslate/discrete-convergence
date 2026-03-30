# Monitoring Specification

## Overview

The Event Management platform uses Pino for structured JSON logging, correlation
IDs for request tracing, and health/metrics endpoints for operational monitoring.
All monitoring components are registered via NestJS dependency injection.

See also: [security.md](security.md) for error sanitization details.
See also: [infrastructure.md](infrastructure.md) for deployment monitoring.

## Global Exception Filter

- VERIFY: EM-MON-001 — GlobalExceptionFilter catches all exceptions, logs sanitized
  error context via PinoLoggerService and sanitizeLogContext from shared, returns
  { statusCode, message, correlationId, timestamp } without stack traces

## Pino Logger

- VERIFY: EM-MON-002 — PinoLoggerService wraps Pino with info/error/warn/debug methods,
  DI-injectable, structured JSON output, configurable LOG_LEVEL

## Request Context

- VERIFY: EM-MON-003 — RequestContextService is request-scoped, stores correlationId,
  userId, and tenantId for the current request lifecycle

## Correlation ID Middleware

- VERIFY: EM-MON-004 — CorrelationIdMiddleware preserves client X-Correlation-ID
  header or generates new UUID via createCorrelationId from shared package

## Request Logging Middleware

- VERIFY: EM-MON-005 — RequestLoggingMiddleware logs method, URL, status code,
  duration, and correlationId using formatLogEntry from shared package

## Metrics Service

- VERIFY: EM-MON-006 — MetricsService tracks in-memory request count, error count,
  total response time, and uptime; provides getMetrics() method

## Monitoring Controller

- VERIFY: EM-MON-007 — MonitoringController exposes GET /health (public, skip throttle)
  returning { status, timestamp, uptime, version } with APP_VERSION from shared

## Database Health Check

- VERIFY: EM-MON-008 — GET /health/ready performs $queryRaw DB connectivity check,
  returns { status, database } — public and rate-limit exempt

## AppModule Registration

- VERIFY: EM-MON-009 — GlobalExceptionFilter registered as APP_FILTER in AppModule
  providers via NestJS DI (not main.ts)

## Middleware Chain Order

1. CorrelationIdMiddleware — assigns/preserves correlation ID
2. RequestLoggingMiddleware — logs request start, logs completion on response finish
3. ThrottlerGuard (APP_GUARD) — rate limiting
4. JwtAuthGuard (APP_GUARD) — authentication
5. RolesGuard (APP_GUARD) — authorization
6. ResponseTimeInterceptor (APP_INTERCEPTOR) — timing
7. GlobalExceptionFilter (APP_FILTER) — error handling

## Health Endpoint Response Format

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

## Metrics Endpoint Response Format

```json
{
  "requestCount": 100,
  "errorCount": 5,
  "averageResponseTime": 42,
  "uptime": 3600
}
```

## Log Format

All log entries use structured JSON via Pino:
- timestamp, level, message
- Optional: correlationId, method, url, statusCode, duration, userId, tenantId

## Sanitization

- sanitizeLogContext from shared redacts: password, passwordHash, token,
  accessToken, secret, authorization (case-insensitive, deep nested, arrays)
