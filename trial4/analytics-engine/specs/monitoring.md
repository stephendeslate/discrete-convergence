# Monitoring Specification

## Overview

The Analytics Engine monitoring subsystem provides structured logging,
correlation ID tracking, health endpoints, metrics, and exception filtering.
All monitoring components use NestJS dependency injection.

See [security.md](security.md) for exception filter security details.
See [cross-layer.md](cross-layer.md) for provider chain integration.

## Requirements

### VERIFY:AE-MON-001
CorrelationIdMiddleware MUST preserve client-provided X-Correlation-ID
header or generate a new UUID via createCorrelationId from shared.

### VERIFY:AE-MON-002
RequestLoggingMiddleware MUST log method, URL, status code, duration,
and correlationId using formatLogEntry from shared.

### VERIFY:AE-MON-003
GlobalExceptionFilter MUST sanitize request body via sanitizeLogContext
from shared before logging. Must NOT expose stack traces in responses.
Must include correlationId in error response body.

### VERIFY:AE-MON-004
RequestContextService MUST be request-scoped (Scope.REQUEST) and store
correlationId, userId, and tenantId per request.

### VERIFY:AE-MON-005
GET /health MUST return: status, timestamp, uptime, and version from
APP_VERSION shared constant. Must be @Public() and @SkipThrottle().

### VERIFY:AE-MON-006
GET /health/ready MUST perform a $queryRaw DB connectivity check.
Must be @Public() and @SkipThrottle().

## Structured Logging

Pino JSON logger is used for all logging:
- Injected via PinoLoggerService (DI-injectable)
- Never uses console.log (binary gate)
- Log levels: info, error, warn, debug
- All log entries include timestamp and structured fields

## Correlation IDs

Request correlation tracking flow:
1. CorrelationIdMiddleware checks for X-Correlation-ID header
2. If present, preserves the client-provided value
3. If absent, generates a new UUID via createCorrelationId()
4. Stores in RequestContextService (request-scoped)
5. Available to all handlers, filters, and middleware within the request

## Health Endpoints

| Endpoint | Purpose | Auth | Throttle |
|----------|---------|------|----------|
| GET /health | Basic health + version | Public | Skipped |
| GET /health/ready | DB connectivity | Public | Skipped |
| GET /metrics | Request/error counts | Public | Skipped |

## Metrics

In-memory metrics tracked by MetricsService:
- requestCount: total HTTP requests processed
- errorCount: total unhandled exceptions
- averageResponseTime: mean response time in ms
- uptime: seconds since service start

## Log Sanitization

sanitizeLogContext from shared redacts sensitive fields:
- password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Recursive for nested objects
- Handles arrays recursively (FM#101 compliance)

## Exception Handling

GlobalExceptionFilter (APP_FILTER):
- Catches all unhandled exceptions
- Sanitizes request body before logging
- Returns standardized error response
- Includes correlationId in response body
- Never exposes stack traces to clients
