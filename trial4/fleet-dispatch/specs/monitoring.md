# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive observability via Pino structured JSON logging,
correlation ID propagation, request logging, health/readiness endpoints, metrics tracking,
and global exception filtering with error sanitization.

## Requirements

### VERIFY:FD-MON-001 — CorrelationIdMiddleware attaches X-Correlation-ID

The CorrelationIdMiddleware must preserve client-supplied X-Correlation-ID headers or
generate a new UUID via createCorrelationId() from shared. The correlation ID is stored
in the RequestContextService and set as a response header.

### VERIFY:FD-MON-002 — RequestLoggingMiddleware logs method, URL, status, duration

The RequestLoggingMiddleware must log HTTP requests using formatLogEntry() from shared.
Log entries must include: method, URL, statusCode, duration (ms), and correlationId.
Logging occurs on response finish event.

### VERIFY:FD-MON-003 — GlobalExceptionFilter sanitizes errors

The GlobalExceptionFilter must be registered as APP_FILTER in AppModule. It must:
sanitize request body via sanitizeLogContext() from shared, include correlationId in
error response body, log errors via PinoLoggerService, and never expose stack traces.

### VERIFY:FD-MON-004 — Pino structured JSON logger (DI-injectable)

PinoLoggerService must wrap the pino logger and be injectable via NestJS DI. It must
provide info, error, warn, and debug methods. No console.log usage in production code.

### VERIFY:FD-MON-005 — sanitizeLogContext redacts sensitive fields

The sanitizeLogContext function in shared must redact: password, passwordHash, token,
accessToken, secret, authorization. Case-insensitive matching. Must handle deep nested
objects and arrays recursively. Unit tests must include array test cases.

### VERIFY:FD-MON-006 — MetricsService tracks request/error counts

MetricsService must track: requestCount, errorCount, totalResponseTime, and uptime.
The getMetrics() method returns all four values plus averageResponseTime (calculated).

### VERIFY:FD-MON-007 — Health, readiness, and metrics endpoints

- GET /health: status, timestamp, uptime, version (from APP_VERSION shared constant)
- GET /health/ready: $queryRaw DB connectivity check
- GET /metrics: request/error counts, average response time, uptime
All three endpoints must be @Public() and @SkipThrottle().

### VERIFY:FD-MON-008 — Monitoring integration tests with supertest

Monitoring tests must use supertest (not unit tests only). Tests must verify: health
response format, readiness endpoint, correlation ID in headers, X-Response-Time header
format, metrics endpoint fields, health endpoint auth exemption.

## Middleware Order

1. CorrelationIdMiddleware — Sets correlation ID
2. RequestLoggingMiddleware — Logs request details

## Related Specifications

- See [security.md](security.md) for error handling security
- See [cross-layer.md](cross-layer.md) for full pipeline verification
