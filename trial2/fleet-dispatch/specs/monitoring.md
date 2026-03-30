# Monitoring Specification

## Overview

Fleet Dispatch implements structured JSON logging with Pino, correlation ID
tracking, health checks, and metrics collection. All monitoring infrastructure
is registered via NestJS DI (APP_FILTER, APP_INTERCEPTOR, middleware).

## Correlation ID Tracking

### VERIFY:FD-MON-002 — Correlation ID Middleware
CorrelationIdMiddleware must:
1. Check for existing X-Correlation-ID header from client
2. If present, preserve it; if absent, generate via createCorrelationId() from shared
3. Set X-Correlation-ID on response header
4. Store in RequestContextService for use by other middleware and filters

### VERIFY:FD-MON-003 — Request Context Service
RequestContextService must be request-scoped (Scope.REQUEST).
Must store correlationId, userId, and tenantId.
Used by CorrelationIdMiddleware, RequestLoggingMiddleware, and GlobalExceptionFilter.

## Request Logging

### VERIFY:FD-MON-004 — Request Logging Middleware
RequestLoggingMiddleware must log:
- HTTP method
- URL
- Response status code
- Request duration in milliseconds
- Correlation ID
Must use formatLogEntry() from shared package for structured output.

## Health Checks

### VERIFY:FD-MON-001 — Health Endpoints
MonitoringController must expose:
- GET /health — returns status, timestamp, uptime, version (from APP_VERSION shared)
- GET /health/ready — performs $queryRaw DB connectivity check
- GET /metrics — returns requestCount, errorCount, averageResponseTime, uptime
All three endpoints must be @Public() and @SkipThrottle().

## Exception Handling

### VERIFY:FD-MON-005 — Global Exception Filter
GlobalExceptionFilter must be registered as APP_FILTER in AppModule.
Must:
1. Extract HTTP status from HttpException or default to 500
2. Sanitize request body via sanitizeLogContext() from shared
3. Log error with correlationId from RequestContextService
4. Return JSON response with statusCode, message, correlationId, timestamp
5. Never include stack traces in response body

### VERIFY:FD-MON-006 — Monitoring Integration Tests
Monitoring must be tested with supertest against real AppModule (not unit-only).
Tests must verify:
- GET /health returns 200 with status, timestamp, uptime, version
- GET /health/ready returns database connectivity status
- GET /metrics returns request counts and uptime
- All monitoring endpoints accessible without authentication

### VERIFY:FD-MON-007 — Log Sanitizer Tests
Log sanitizer tests must include array test cases.
Must verify:
- Simple field redaction (password, token, secret, authorization)
- Case-insensitive key matching
- Deep nested object sanitization
- Array recursion (arrays of objects with sensitive fields)
- Nested arrays within objects
- Null and undefined pass-through
- Primitive pass-through

## Log Sanitizer

The sanitizeLogContext function handles:
- Case-insensitive matching of sensitive keys
- Deep nested object traversal
- Array recursion (each element sanitized recursively)
- Sensitive keys: password, passwordHash, token, accessToken, secret,
  authorization, refreshToken, apiKey
