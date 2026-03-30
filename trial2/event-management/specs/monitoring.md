# Monitoring Specification

## Overview

The Event Management platform implements structured logging, correlation ID
tracking, health endpoints, metrics, and centralized error handling for
observability and debugging.

## Correlation ID

<!-- VERIFY:EM-MON-001 — CorrelationIdMiddleware preserves or generates correlation ID -->
`CorrelationIdMiddleware` handles correlation ID propagation:
- Checks `X-Correlation-ID` request header
- If present, preserves the client-provided ID
- If absent, generates a new UUID via `createCorrelationId()` from shared
- Sets `X-Correlation-ID` response header

## Request Logging

<!-- VERIFY:EM-MON-002 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId -->
`RequestLoggingMiddleware` logs structured entries for every request:
- HTTP method
- Request URL
- Response status code
- Duration in milliseconds
- Correlation ID
- Uses `formatLogEntry()` from shared for consistent formatting

## Error Handling

<!-- VERIFY:EM-MON-003 — GlobalExceptionFilter sanitizes errors, includes correlationId -->
`GlobalExceptionFilter` registered as `APP_FILTER`:
- Catches all unhandled exceptions
- Returns sanitized error response (no stack traces)
- Includes `correlationId` in error response body
- Sanitizes request body via `sanitizeLogContext()` from shared
- Logs full error details internally

## Health Endpoints

<!-- VERIFY:EM-MON-004 — Health endpoints with @Public() and @SkipThrottle() -->
Health endpoints are exempt from both authentication and rate limiting:

### GET /health
- Returns: status, timestamp, uptime, version
- Version from `APP_VERSION` shared constant
- Exempt from auth (`@Public()`) and rate limiting (`@SkipThrottle()`)

<!-- VERIFY:EM-MON-005 — Health returns APP_VERSION from shared -->
The health endpoint response includes `version` from `APP_VERSION`.

### GET /health/ready

<!-- VERIFY:EM-MON-006 — /health/ready performs $queryRaw DB connectivity check -->
- Performs `$queryRaw` database connectivity check
- Returns database connection status
- Exempt from auth and rate limiting

### GET /metrics
- Returns: requestCount, errorCount, averageResponseTime, uptime
- In-memory counters for request tracking
- Exempt from auth and rate limiting

## Log Sanitization

<!-- VERIFY:EM-MON-007 — Log sanitizer handles arrays recursively with case-insensitive matching -->
`sanitizeLogContext()` from shared package:
- Redacts sensitive keys: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Deep nested object traversal
- Array recursion support
- Returns sanitized copy (does not mutate original)
