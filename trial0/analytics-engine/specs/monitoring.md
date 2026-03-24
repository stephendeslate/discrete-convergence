# Monitoring Specification

## Overview

Comprehensive observability with structured logging, request correlation,
health/readiness probes, metrics collection, and frontend error reporting.

## Health Endpoint

- VERIFY:AE-MON-007 — MonitoringService provides health check
- VERIFY:AE-MON-008 — Health response includes APP_VERSION from shared constants
- GET /api/monitoring/health returns { status: 'ok', version: '1.0.0' }
- Exempt from auth (@Public) and rate limiting (@SkipThrottle)

## Readiness Endpoint

- VERIFY:AE-MON-009 — Readiness check uses $queryRaw for DB connectivity
- GET /api/monitoring/ready returns { status: 'ready' } or 503 with { status: 'not_ready' }
- Tests actual database connection, not just process status
- Used by Docker HEALTHCHECK and Kubernetes readiness probes

## Metrics Endpoint

- VERIFY:AE-MON-010 — In-memory metrics service tracks request/error counts
- GET /api/monitoring/metrics returns counters and rates
- Tracks: total requests, errors by status code, average response time
- VERIFY:AE-MON-011 — All monitoring endpoints exempt from auth and throttle

## Frontend Error Reporting

- VERIFY:AE-FE-001 — POST /api/monitoring/errors receives error reports from frontend
- Error boundary component catches React errors and POSTs to this endpoint
- Payload: message, stack, componentStack, url, userAgent
- Returns 201 Created on success

## Structured Logging

- VERIFY:AE-MON-006 — Pino-based structured JSON logger, DI-injectable
- VERIFY:AE-LOG-001 — formatLogEntry from shared creates consistent log structure
- Log fields: timestamp, level, message, correlationId, method, url, statusCode, duration
- No console.log in production code (convention gate)

## Request Correlation

- VERIFY:AE-MON-003 — CorrelationIdMiddleware preserves incoming X-Correlation-ID or generates new
- VERIFY:AE-CORR-001 — createCorrelationId() uses crypto.randomUUID()
- Correlation ID flows through: middleware → request context → logger → error filter → response
- VERIFY:AE-MON-005 — Request-scoped context stores correlationId, userId, tenantId

## Request Logging

- VERIFY:AE-MON-004 — Request logging middleware logs method, url, status, duration
- Uses formatLogEntry from shared for consistent format
- Applied via middleware consumer in AppModule

## Response Time

- VERIFY:AE-PERF-002 — ResponseTimeInterceptor uses performance.now() from perf_hooks
- VERIFY:AE-PERF-001 — Registered as APP_INTERCEPTOR via DI
- Sets X-Response-Time header on every response (milliseconds)
- Precision: sub-millisecond via performance.now()

## Exception Filter

- VERIFY:AE-FILTER-001 — GlobalExceptionFilter registered as APP_FILTER
- Catches HttpException and unknown errors
- Logs with sanitized context (no passwords/tokens in logs)
- Response includes correlationId but not stack traces

## Test Coverage

- VERIFY:AE-TEST-004 — Monitoring integration tests: health, ready, metrics, error POST,
  X-Response-Time header
- VERIFY:AE-TEST-003 — Cross-layer tests verify correlation ID in error responses,
  health with APP_VERSION, readiness with DB check

## Cross-References

- See [security.md](security.md) for error sanitization details
- See [frontend.md](frontend.md) for error boundary component
- See [infrastructure.md](infrastructure.md) for Docker HEALTHCHECK using health endpoint
- See [api-endpoints.md](api-endpoints.md) for monitoring route registration
