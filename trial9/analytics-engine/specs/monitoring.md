# Monitoring & Performance Specification

## Overview

The Analytics Engine implements comprehensive observability through structured logging,
correlation IDs, health checks, metrics collection, and performance instrumentation.

See also: [Security Specification](security.md) for error sanitization details.
See also: [Infrastructure Specification](infrastructure.md) for deployment health checks.

## Requirements

### Constants & Configuration

- VERIFY: AE-MON-001 — APP_VERSION constant exported from shared package for runtime identification
- VERIFY: AE-MON-002 — createCorrelationId generates unique UUIDs for request tracing
- VERIFY: AE-MON-003 — formatLogEntry produces structured JSON log entries with timestamp, level, correlationId, message

### Error Handling

- VERIFY: AE-MON-004 — GlobalExceptionFilter catches all exceptions and returns sanitized error responses

### Middleware

- VERIFY: AE-MON-005 — CorrelationIdMiddleware attaches correlation ID to every request via X-Correlation-Id header
- VERIFY: AE-MON-006 — RequestLoggingMiddleware logs method, url, status, and duration using formatLogEntry

### Request Context

- VERIFY: AE-MON-007 — RequestContextService stores per-request correlation ID in AsyncLocalStorage or request scope

### Logging

- VERIFY: AE-MON-008 — PinoLoggerService provides structured logging with Pino, respects LOG_LEVEL env var

### Metrics

- VERIFY: AE-MON-009 — MetricsService tracks request counts, error counts, and response time histograms

### Endpoints

- VERIFY: AE-MON-010 — MonitoringController exposes GET /health as @Public() @SkipThrottle() returning { status: 'ok' }
- VERIFY: AE-MON-011 — MonitoringController exposes GET /metrics as @Public() @SkipThrottle() returning collected metrics
- VERIFY: AE-MON-012 — Monitoring integration tests verify health, ready, metrics, and correlation ID propagation

### Performance

- VERIFY: AE-PERF-001 — MAX_PAGE_SIZE constant (100) exported from shared for pagination clamping
- VERIFY: AE-PERF-002 — DEFAULT_PAGE_SIZE constant (20) exported from shared for default pagination
- VERIFY: AE-PERF-003 — parsePagination clamps page size to MAX_PAGE_SIZE and defaults to DEFAULT_PAGE_SIZE
- VERIFY: AE-PERF-004 — ResponseTimeInterceptor measures request duration using performance.now() and sets X-Response-Time header
- VERIFY: AE-PERF-005 — DashboardController list endpoint applies pagination with clamped page size
- VERIFY: AE-PERF-006 — Performance tests verify X-Response-Time header, pagination clamping, and Cache-Control headers

## Health Check Design

The monitoring system provides three health endpoints:

1. **GET /health** — Shallow liveness check, returns `{ status: 'ok' }` immediately
2. **GET /ready** — Deep readiness check, executes `SELECT 1` via `$queryRaw` to verify DB connectivity
3. **GET /metrics** — Returns aggregated metrics (request counts, error rates, response times)

All three endpoints are decorated with `@Public()` to bypass JWT authentication
and `@SkipThrottle()` to bypass rate limiting, ensuring monitoring tools
can always access them.

## Correlation ID Flow

1. CorrelationIdMiddleware generates UUID via `createCorrelationId()`
2. UUID attached to request object and `X-Correlation-Id` response header
3. RequestContextService stores ID for access in services and filters
4. GlobalExceptionFilter includes correlationId in error responses
5. RequestLoggingMiddleware includes correlationId in structured log entries

## Performance Instrumentation

ResponseTimeInterceptor wraps every request handler:
- Records start time via `performance.now()` (from `perf_hooks`)
- Calculates duration on response
- Sets `X-Response-Time` header with millisecond precision

Pagination clamping prevents unbounded queries:
- Client requests `pageSize` > MAX_PAGE_SIZE → clamped to 100
- Client omits `pageSize` → defaults to DEFAULT_PAGE_SIZE (20)
- Client requests `page` < 1 → defaults to 1
