# Monitoring Specification

## Overview

The Event Management platform implements comprehensive monitoring: Pino structured
JSON logging, correlation ID tracking, request logging, health/readiness endpoints,
metrics collection, and a global exception filter with sanitized error responses.

See [cross-layer.md](cross-layer.md) for how monitoring integrates with other layers.

## Requirements

### VERIFY:EM-MON-001 — Correlation ID Generator from Shared
The `createCorrelationId()` function from `@event-management/shared` generates
UUID-based correlation IDs. Used by the CorrelationIdMiddleware when no client
X-Correlation-ID header is present.

### VERIFY:EM-MON-002 — Structured Log Entry Format
The `formatLogEntry()` function from shared formats request log data into a
structured object with: timestamp, level, method, url, statusCode, duration,
correlationId. Log level is derived from status code (500+ = error, 400+ = warn).

### VERIFY:EM-MON-003 — Log Context Sanitization
The `sanitizeLogContext()` function from shared redacts sensitive fields:
password, passwordHash, token, accessToken, secret, authorization.
Handles case-insensitive matching, deep nested objects, and arrays recursively.
Unit tests cover array test cases.

### VERIFY:EM-MON-004 — Global Exception Filter
The GlobalExceptionFilter is registered as APP_FILTER in AppModule providers.
It returns sanitized error responses with: statusCode, message, correlationId,
timestamp. No stack traces are exposed. Request bodies are sanitized via
`sanitizeLogContext` before logging.

### VERIFY:EM-MON-005 — Correlation ID Middleware
The CorrelationIdMiddleware preserves client-provided X-Correlation-ID headers
or generates a new UUID via `createCorrelationId()` from shared. The correlation
ID is stored in RequestContextService for the request lifecycle.

### VERIFY:EM-MON-006 — Request Logging Middleware
The RequestLoggingMiddleware logs completed requests using `formatLogEntry()`
from shared. Captures method, URL, status code, duration (ms), and correlation ID.

### VERIFY:EM-MON-007 — Pino Structured Logger
The LoggerService wraps Pino for structured JSON logging. It is DI-injectable
and provides info, warn, error, debug methods. No `console.log` is used in
production API code.

### VERIFY:EM-MON-008 — Health Endpoints Exempt from Auth and Rate Limiting
Health endpoints are decorated with both `@Public()` and `@SkipThrottle()`:
- GET /health: status, timestamp, uptime, version (from APP_VERSION)
- GET /health/ready: `$queryRaw` DB connectivity check
- GET /metrics: request count, error count, avg response time, uptime, version

### VERIFY:EM-MON-009 — Monitoring Service with APP_VERSION
The MonitoringService uses `APP_VERSION` from `@event-management/shared` in
both the health endpoint and metrics endpoint. Tracks in-memory request/error
counts and average response time. DB readiness uses `$queryRaw\`SELECT 1\``.

## Request Context

RequestContextService is request-scoped and stores:
- correlationId: UUID for request tracing
- userId: extracted from JWT token
- tenantId: organization ID for multi-tenant context

## Error Response Format

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "correlationId": "uuid-here",
  "timestamp": "2026-03-24T00:00:00.000Z"
}
```
