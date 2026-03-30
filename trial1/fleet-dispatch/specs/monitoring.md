# Monitoring Specification

> **Cross-references:** See [authentication.md](authentication.md), [api-endpoints.md](api-endpoints.md), [security.md](security.md), [infrastructure.md](infrastructure.md)

## Overview

Fleet Dispatch implements structured logging with Pino, request correlation IDs,
request/response logging, exception filtering, health checks, and in-memory
metrics collection. All monitoring components are DI-injectable NestJS services.

## Structured Logging

### Pino Logger
- VERIFY:FD-MON-001 — Pino structured JSON logger, DI-injectable
- PinoLoggerService wraps Pino for structured JSON output
- Configurable log levels via environment
- Injectable via NestJS DI for consistent logging across services

### Correlation IDs
- VERIFY:FD-MON-002 — CorrelationIdMiddleware preserves or generates correlation ID
- Middleware checks for existing X-Correlation-ID header
- Generates new UUID via createCorrelationId() from shared if absent
- Sets correlation ID on response header and request context
- Applied to all routes via AppModule.configure()

### Request Context
- VERIFY:FD-MON-003 — RequestContextService (request-scoped) for correlationId, userId, tenantId
- Request-scoped service preserving correlation context
- Stores: correlationId, userId, tenantId (companyId)
- Available for injection in any request-handling service

### Request Logging
- VERIFY:FD-MON-004 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId
- Logs: HTTP method, URL, status code, response duration in ms
- Uses formatLogEntry from @fleet-dispatch/shared for consistent format
- Includes correlationId from request context

### Exception Filter
- VERIFY:FD-MON-005 — GlobalExceptionFilter as APP_FILTER with sanitized errors
- Catches all exceptions, returns consistent error response
- Uses sanitizeLogContext from @fleet-dispatch/shared
- Strips sensitive fields (password, token, secret, authorization)
- Registered as APP_FILTER in AppModule

## Health Checks

### Health Endpoints
- VERIFY:FD-MON-006 — Health endpoints with @Public() and @SkipThrottle()
- GET /health — returns { status: 'ok', version: APP_VERSION, timestamp }
- GET /health/ready — readiness probe with database connectivity check
  - Uses $queryRaw`SELECT 1` to verify database connection
  - Returns database: 'connected' or 'disconnected'
- Both endpoints decorated with @Public() and @SkipThrottle()
- APP_VERSION from @fleet-dispatch/shared

## Metrics

### In-Memory Metrics
- VERIFY:FD-MON-007 — In-memory metrics: request/error counts, average response time, uptime
- MetricsService tracks: totalRequests, totalErrors, averageResponseTime, uptime
- Response time buffer capped at 10,000 entries (pruned to 5,000)
- Uptime calculated from service start time

### Metrics Endpoint
- VERIFY:FD-MON-008 — Metrics endpoint exposing in-memory counters
- GET /metrics — returns all metrics from MetricsService
- Decorated with @Public() and @SkipThrottle()
- Used by monitoring dashboards and alerting systems

## Cross-References

- Response time interceptor: see performance.md (FD-PERF-001)
- Middleware registration: see cross-layer.md (FD-CL-003)
- Log sanitizer tests: see packages/shared/__tests__/log-sanitizer.spec.ts
