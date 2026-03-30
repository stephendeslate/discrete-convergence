# Monitoring Specification

## Overview

Fleet Dispatch implements structured logging with Pino,
correlation ID tracking, request logging, health checks,
metrics, and error handling.

## Structured Logging

### Pino Logger
- DI-injectable via `PINO_LOGGER` token
- Structured JSON output
- Never uses console.log in production code

### Log Entry Format
- timestamp: ISO 8601
- level: info, warn, error
- message: descriptive text
- correlationId: request-scoped UUID
- method: HTTP method
- url: request URL
- statusCode: response code
- duration: response time in ms

## Correlation IDs

<!-- VERIFY:FD-MON-003 — createCorrelationId generates UUID from shared package -->
<!-- VERIFY:FD-MON-004 — formatLogEntry creates structured log entries with timestamp -->
<!-- VERIFY:FD-MON-005 — sanitizeLogContext redacts sensitive fields recursively -->
<!-- VERIFY:FD-MON-006 — RequestContextService is request-scoped with correlationId -->
<!-- VERIFY:FD-MON-007 — CorrelationIdMiddleware preserves or generates correlation ID -->
<!-- VERIFY:FD-MON-008 — RequestLoggingMiddleware logs request details with Pino -->

### CorrelationIdMiddleware
- Preserves client-provided X-Correlation-ID header
- Generates UUID via createCorrelationId() from shared if not present
- Stores in RequestContextService for request scope

### RequestContextService
- Request-scoped (Scope.REQUEST)
- Fields: correlationId, userId, tenantId

## Request Logging

### RequestLoggingMiddleware
- Logs on response finish event
- Records method, URL, status, duration, correlationId
- Uses formatLogEntry from shared package

## Health Checks

<!-- VERIFY:FD-MON-001 — MonitoringService.getHealth returns status, timestamp, uptime, APP_VERSION -->
<!-- VERIFY:FD-MON-002 — MonitoringService.getReadiness uses $queryRaw for DB check -->

### GET /health
- Returns status, timestamp, uptime, version
- Version from APP_VERSION shared constant
- Exempt from auth (@Public()) and rate limiting (@SkipThrottle())

### GET /health/ready
- Performs `$queryRaw SELECT 1` to check DB connectivity
- Returns database connection status
- Exempt from auth and rate limiting

## Metrics

<!-- VERIFY:FD-MON-010 — MonitoringController exposes /health, /health/ready, /metrics -->

### GET /metrics
- Requires authentication
- Returns: requestCount, errorCount, averageResponseTime, uptime
- In-memory counters (reset on restart)

## Error Handling

<!-- VERIFY:FD-MON-009 — GlobalExceptionFilter sanitizes errors and includes correlationId -->

### GlobalExceptionFilter
- Registered as APP_FILTER in AppModule
- Sanitizes error responses (no stack traces)
- Includes correlationId in response body
- Logs error with sanitized request body
- Uses sanitizeLogContext from shared for body redaction

## Log Sanitization

### sanitizeLogContext
- Redacts: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Deep nested object recursion
- Array recursion support
- Primitives passed through unchanged
