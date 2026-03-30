# FD-SPEC-006: Monitoring

## Overview
Fleet Dispatch implements structured logging, request tracing via correlation IDs,
health checks, and in-memory metrics.

## Health Check
- GET /monitoring/health returns `{status, version, timestamp}`
- Public endpoint (no auth required)

<!-- VERIFY:FD-MON-001 — APP_VERSION exported from shared constants -->
<!-- VERIFY:FD-MON-011 — monitoring controller exposes health and metrics -->

## Correlation IDs
- Every request gets a correlation ID (UUID v4)
- Client can pass `X-Correlation-Id` header to preserve their ID
- ID propagated through logs and error responses

<!-- VERIFY:FD-MON-002 — correlation ID generation via randomUUID -->
<!-- VERIFY:FD-MON-009 — middleware preserves client header or generates new ID -->

## Structured Logging
- Pino logger for JSON-structured output
- Log entries include: timestamp, level, message, method, URL, status, duration, correlationId
- Sensitive fields (password, token, secret) are automatically redacted

<!-- VERIFY:FD-MON-003 — formatLogEntry produces JSON string -->
<!-- VERIFY:FD-MON-004 — sanitizeLogContext redacts sensitive keys -->
<!-- VERIFY:FD-MON-005 — PinoLoggerService wraps pino with info/warn/error/debug -->
<!-- VERIFY:FD-MON-010 — request logging middleware logs method, URL, status, duration -->

## Metrics
- In-memory counters: request count, error count, total response time
- GET /monitoring/metrics returns aggregated stats
- Response time tracked via interceptor (X-Response-Time header)

<!-- VERIFY:FD-MON-007 — MetricsService tracks requests, errors, avg response time, uptime -->

## Error Handling
- Global exception filter catches all errors
- HTTP exceptions preserve their status code
- Unknown errors return 500 with sanitized message
- All errors logged with correlation ID

<!-- VERIFY:FD-MON-008 — GlobalExceptionFilter with sanitized error responses -->

## Request Context
- Request-scoped service carries correlationId, userId, tenantId
- Available for injection in any request-scoped provider

<!-- VERIFY:FD-MON-006 — RequestContextService is REQUEST scoped -->

## Performance
- Response time measured via interceptor and reported in header
- Metrics service aggregates for dashboard consumption

<!-- VERIFY:FD-PERF-002 — ResponseTimeInterceptor sets X-Response-Time header -->
