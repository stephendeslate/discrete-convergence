# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive observability with structured JSON
logging (Pino), correlation ID tracking, health endpoints, metrics collection,
and centralized error handling. See [security.md](security.md) for error
sanitization details.

## Correlation IDs

- VERIFY: FD-MON-001 — createCorrelationId() generates UUID v4 for request tracking
- VERIFY: FD-MON-005 — CorrelationIdMiddleware preserves client X-Correlation-ID or generates new UUID

## Structured Logging

- VERIFY: FD-MON-002 — LogEntry interface defines structured log format with all required fields
- VERIFY: FD-MON-003 — formatLogEntry() creates JSON-formatted log entries with timestamp
- VERIFY: FD-MON-004 — LoggerService wraps Pino with info, error, warn, debug methods

## Request Logging

- VERIFY: FD-MON-007 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId using formatLogEntry

## Request Context

- VERIFY: FD-MON-006 — RequestContextService is request-scoped, stores correlationId, userId, tenantId

## Health Endpoints

- VERIFY: FD-MON-008 — GET /health returns status, timestamp, uptime, version (from APP_VERSION)
- VERIFY: FD-MON-009 — GET /health/ready checks database connectivity via $queryRaw

Health endpoints are:
- Exempt from authentication (@Public())
- Exempt from rate limiting (@SkipThrottle())

## Metrics

- VERIFY: FD-MON-010 — MonitoringService tracks request count, error count, average response time

GET /metrics returns:
- requestCount — total requests processed
- errorCount — total errors recorded
- averageResponseTime — average response time in ms
- uptime — process uptime in seconds

## Error Reporting

POST /errors accepts frontend error reports:
- message — error message
- stack — optional stack trace
- url — page URL where error occurred

## Middleware Chain

Applied in order via AppModule.configure():
1. CorrelationIdMiddleware — sets X-Correlation-ID header
2. RequestLoggingMiddleware — logs request with duration

## Logger Configuration

Pino structured JSON logger:
- Level from LOG_LEVEL env var (default: info)
- ISO timestamp format
- Formatted level labels
- No console.log in production code

## Dashboard Integration

- Metrics endpoint available for external monitoring tools
- Health endpoint suitable for container orchestration
- Readiness endpoint verifies database connectivity
- All monitoring endpoints publicly accessible

## Error Response Format

All errors include:
- statusCode — HTTP status code
- message — sanitized error message
- correlationId — request correlation ID
- timestamp — ISO timestamp

No stack traces are included in production responses.
