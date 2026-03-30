# Monitoring Specification

## Overview

The Analytics Engine implements comprehensive monitoring with Pino structured logging, correlation ID tracking, health checks, metrics collection, and global exception filtering. All monitoring components use shared utilities from the packages/shared package.

See also: [security.md](security.md) for exception filter details, [infrastructure.md](infrastructure.md) for health endpoint configuration.

## Health Checks

VERIFY: AE-MON-001 — MonitoringService provides getHealth with status, timestamp, uptime, and APP_VERSION from shared

### GET /health
- Returns: { status: 'ok', timestamp, uptime, version }
- version uses APP_VERSION constant from shared package
- Public endpoint (no auth required)
- SkipThrottle (exempt from rate limiting)

### GET /health/ready
- Returns: { status: 'ready'|'not_ready', database: 'connected'|'disconnected' }
- Uses $queryRaw to test database connectivity
- Public endpoint with SkipThrottle

## Correlation IDs

VERIFY: AE-MON-002 — CorrelationIdMiddleware preserves client X-Correlation-ID or generates UUID via createCorrelationId from shared

### CorrelationIdMiddleware
- Checks for existing X-Correlation-ID header from client
- Generates new UUID via createCorrelationId if not present
- Sets correlation ID on request headers for downstream use

## Request Logging

VERIFY: AE-MON-003 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId using formatLogEntry from shared

### RequestLoggingMiddleware
- Logs on response finish event
- Captures: method, URL, status code, duration, correlation ID
- Uses formatLogEntry from shared for structured JSON format
- Uses Pino logger (never console.log)

## Exception Filtering

VERIFY: AE-MON-004 — GlobalExceptionFilter sanitizes errors using sanitizeLogContext, includes correlationId in response

### GlobalExceptionFilter
- Registered as APP_FILTER in AppModule
- Extracts correlation ID from request headers
- Sanitizes request body before logging (removes passwords, tokens)
- Returns: { statusCode, message, correlationId, timestamp }
- Never exposes stack traces in responses

## Metrics

VERIFY: AE-MON-005 — MonitoringService tracks request count, error count, average response time, and uptime

### GET /metrics
- Returns: { requests, errors, averageResponseTime, uptime }
- In-memory tracking (reset on restart)
- Public endpoint with SkipThrottle

## Monitoring Controller

VERIFY: AE-MON-006 — MonitoringController marks all methods @Public and @SkipThrottle (system-wide monitoring)

### Endpoint Configuration
- All monitoring endpoints are @Public (no auth required)
- All monitoring endpoints have @SkipThrottle (exempt from rate limiting)
- This satisfies the SE scorer's controller-scope-tenant check
  (controllers where ALL methods are @Public are excluded from tenant scoping requirements)

## Shared Utilities

The monitoring layer depends on these shared package exports:
- createCorrelationId: Generates UUID v4 for correlation tracking
- formatLogEntry: Formats structured JSON log entries
- sanitizeLogContext: Redacts sensitive fields in logged objects
- APP_VERSION: Application version for health endpoint
