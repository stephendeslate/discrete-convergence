# Monitoring Specification

## Overview

The Analytics Engine provides structured logging, health checks, metrics collection,
and request correlation through a comprehensive monitoring layer.

See also: [Infrastructure](infrastructure.md) for Docker health checks.
See also: [Security](security.md) for error response sanitization.

## Correlation IDs

VERIFY: AE-MON-001
APP_VERSION constant from shared package used in health endpoint responses.

VERIFY: AE-MON-002
createCorrelationId generates UUID v4 for request tracking.

## Structured Logging

VERIFY: AE-MON-003
LogEntry interface defines structured log format with timestamp, level, correlationId.

VERIFY: AE-MON-004
formatLogEntry creates standardized log entries with request metadata.

VERIFY: AE-MON-005
RequestContextService is request-scoped and stores correlationId, userId, tenantId.

## Error Handling

VERIFY: AE-MON-006
GlobalExceptionFilter catches all exceptions and returns sanitized JSON responses.

## Middleware

VERIFY: AE-MON-007
CorrelationIdMiddleware preserves client X-Correlation-ID or generates new UUID.

VERIFY: AE-MON-008
RequestLoggingMiddleware logs method, URL, status, duration using formatLogEntry.

## Health Checks

VERIFY: AE-MON-009
Monitoring controller exposes /monitoring/health, /monitoring/health/ready, /monitoring/metrics.
All methods are @Public() (system-wide, no tenant scoping needed).

VERIFY: AE-MON-010
MonitoringService tracks request counts, error counts, average response time.

VERIFY: AE-MON-011
Health endpoint returns status, timestamp, uptime, version from APP_VERSION.

VERIFY: AE-MON-012
Readiness endpoint checks database connectivity via $queryRaw.

## Metrics

VERIFY: AE-MON-013
Metrics endpoint returns requestCount, errorCount, averageResponseTime, uptime.

## Logger Configuration

- Pino structured JSON logging
- No console.log in production code
- Error filter uses sanitizeLogContext from shared package
- Request body sanitized before logging (passwords, tokens redacted)

## Health Endpoint Details

### GET /monitoring/health
- Returns: { status: 'ok', timestamp, uptime, version }
- Exempt from auth and rate limiting

### GET /monitoring/health/ready
- Returns: { status: 'ready'|'not_ready', database, timestamp }
- Checks PostgreSQL connectivity

### GET /monitoring/metrics
- Returns: { requestCount, errorCount, averageResponseTime, uptime, timestamp }
- In-memory metrics (reset on restart)
