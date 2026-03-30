# Monitoring Specification

## Overview

The Analytics Engine implements structured logging, correlation IDs, health checks,
metrics collection, and error reporting for production observability.

See also: [Security](security.md) for error sanitization.
See also: [Infrastructure](infrastructure.md) for Docker health checks.

## Structured Logging

VERIFY: AE-MON-001
Pino structured JSON logger is injectable via NestJS DI.
No console.log usage in production API code.
LoggerService implements NestJS LoggerService interface.

## Request Context

VERIFY: AE-MON-002
RequestContextService is request-scoped and stores correlationId,
userId, and tenantId for the current request lifecycle.

## Correlation IDs

VERIFY: AE-MON-003
CorrelationIdMiddleware preserves client X-Correlation-ID or generates
a new UUID via createCorrelationId from shared package.
The correlation ID is set on the response header.

## Request Logging

VERIFY: AE-MON-004
RequestLoggingMiddleware logs method, URL, status code, duration,
correlationId using formatLogEntry from shared package.
Logs are emitted on response finish event.

## Error Handling

VERIFY: AE-MON-005
GlobalExceptionFilter catches all exceptions:
- Extracts HTTP status from HttpException or defaults to 500
- Sanitizes request body via sanitizeLogContext
- Returns { statusCode, message, correlationId, timestamp }
- Never exposes stack traces in response body
- Logs full error details internally

## Health Endpoints

VERIFY: AE-MON-006
GET /health returns:
- status: 'ok'
- timestamp: ISO date string
- uptime: process.uptime()
- version: APP_VERSION from shared package
Health endpoints are @Public() and @SkipThrottle().

VERIFY: AE-MON-007
GET /health/ready performs database connectivity check:
- Uses $queryRaw`SELECT 1` to verify PostgreSQL connection
- Returns { status: 'ready', database: 'connected' } on success
- Returns { status: 'not_ready', database: 'disconnected' } on failure

## Metrics

VERIFY: AE-MON-008
MonitoringService tracks in-memory metrics:
- requestCount: total HTTP requests
- errorCount: total errors reported
- avgResponseTime: average response duration
- uptime: process.uptime()
GET /metrics returns all metrics as JSON.

## Monitoring Tests

VERIFY: AE-MON-009
Monitoring integration tests verify with supertest:
- Health endpoint returns version and status
- Health/ready checks database connectivity
- Metrics endpoint returns request counts
- Correlation ID header on all responses
- Client correlation ID preservation
- Frontend error reporting via POST /errors
