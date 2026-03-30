# Monitoring Specification

## Overview

The Event Management platform implements structured logging, correlation ID tracking,
health checks, metrics collection, and global error handling using Pino logger
and NestJS middleware/interceptors.

## Requirements

### VERIFY:EM-MON-001
PinoLoggerService must implement NestJS LoggerService interface.
Uses pino for structured JSON logging. Never uses console.log.

### VERIFY:EM-MON-002
RequestContextService must be request-scoped (Scope.REQUEST).
Stores correlationId, userId, and tenantId per request.

### VERIFY:EM-MON-003
CorrelationIdMiddleware must preserve client X-Correlation-ID header
or generate a new UUID via createCorrelationId from shared package.

### VERIFY:EM-MON-004
RequestLoggingMiddleware logs method, URL, statusCode, duration,
and correlationId using formatLogEntry from shared package.

### VERIFY:EM-MON-005
GlobalExceptionFilter must be registered as APP_FILTER in AppModule.
Must sanitize request body using sanitizeLogContext from shared.
Must include correlationId in error response body.
Must not expose stack traces in responses.

### VERIFY:EM-MON-006
MonitoringService provides getHealth (status, timestamp, uptime, version from APP_VERSION),
getReadiness ($queryRaw DB connectivity check), and getMetrics (request/error counts, avg response time).

### VERIFY:EM-MON-007
MonitoringController exposes: GET /health (@Public + @SkipThrottle),
GET /health/ready (@Public + @SkipThrottle), GET /metrics (authenticated).

## Correlation ID Tracking

- Every request gets a correlation ID (from header or generated)
- ID is stored in request-scoped RequestContextService
- ID is included in all log entries for the request
- ID is included in error response bodies
- Generated via createCorrelationId() from shared package

## Health Checks

- GET /health: lightweight check returning status, timestamp, uptime, version
- GET /health/ready: DB connectivity check via $queryRaw`SELECT 1`
- Both endpoints exempt from auth (@Public) and rate limiting (@SkipThrottle)

## Metrics

- GET /metrics: returns in-memory counters
- Tracks: total requests, error count, average response time, uptime
- Requires authentication (not public)

## Error Handling

- GlobalExceptionFilter catches all exceptions
- HTTP exceptions return their status and message
- Non-HTTP exceptions return 500 with generic message
- Request bodies are sanitized via sanitizeLogContext before logging
- Stack traces are never included in response payloads
- correlationId is always present in error response body

## Log Sanitization

- sanitizeLogContext from shared redacts sensitive fields
- Redacted keys: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Handles nested objects and arrays recursively
