# Monitoring Specification

## Overview

The Event Management platform implements structured logging, health checks,
metrics collection, and error tracking for production observability.

## Logging

VERIFY: EM-MON-001 — APP_VERSION constant exported from shared package for health endpoint

VERIFY: EM-MON-002 — createCorrelationId generates UUID for request tracing

VERIFY: EM-MON-003 — formatLogEntry produces structured JSON log entries with timestamp, level, message

VERIFY: EM-MON-004 — sanitizeLogContext redacts sensitive fields (password, token, secret, authorization) in nested objects and arrays

### Pino Logger
Structured JSON logging via Pino. No console.log in production API code.
All log entries include correlation ID for request tracing.

### Correlation ID Middleware

VERIFY: EM-MON-006 — CorrelationIdMiddleware preserves client X-Correlation-ID or generates new UUID

Preserves client-provided X-Correlation-ID header or generates a new UUID
via createCorrelationId from shared package.

### Request Logging Middleware

VERIFY: EM-MON-007 — RequestLoggingMiddleware logs method, URL, status code, duration, correlationId

Logs request completion with method, URL, status code, duration, and correlation ID
using formatLogEntry from shared package.

## Health Endpoints

VERIFY: EM-MON-008 — Monitoring controller provides /health, /health/ready, and /metrics endpoints exempt from auth and throttling

### GET /health
Returns: status, timestamp, uptime (seconds), version (APP_VERSION from shared)
Exempt from auth (@Public) and rate limiting (@SkipThrottle)

### GET /health/ready
Returns: status, database connectivity (via $queryRaw SELECT 1)
Exempt from auth (@Public) and rate limiting (@SkipThrottle)

### GET /metrics
Returns: requestCount, errorCount, averageResponseTime, uptime
Exempt from auth (@Public) and rate limiting (@SkipThrottle)

## Error Handling

VERIFY: EM-MON-005 — GlobalExceptionFilter catches all exceptions, returns sanitized error with correlationId

GlobalExceptionFilter (registered as APP_FILTER):
- Catches all unhandled exceptions
- Returns structured error: statusCode, message, correlationId, timestamp
- Does NOT leak stack traces
- Logs sanitized request body via sanitizeLogContext

## Log Sanitizer

The sanitizeLogContext function from shared:
- Redacts: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Handles deep nested objects recursively
- Handles arrays recursively
- Returns null/undefined/primitives unchanged

## Cross-References

- See [security.md](security.md) for global exception filter details
- See [infrastructure.md](infrastructure.md) for shared package exports
