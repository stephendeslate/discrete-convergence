# Monitoring Specification

## Overview

The Analytics Engine provides health checks, metrics collection,
structured logging, and request tracing through correlation IDs.

## Health Checks

### GET /health

Returns basic application health:
- status: 'ok'
- timestamp: ISO string
- uptime: process.uptime() in seconds
- version: APP_VERSION from @repo/shared

VERIFY: AE-MON-001 — Health endpoint returns status, timestamp, uptime, and version

### GET /health/ready

Readiness probe that verifies database connectivity:
- Executes SELECT 1 via prisma.$queryRaw
- Returns { database: 'connected' } on success
- Returns { database: 'disconnected' } on failure

Both health endpoints are @Public() (no authentication required).

## Metrics

### GET /metrics

Returns application metrics:
- requests: total request count
- errors: total error count
- averageResponseTime: calculated from total/count
- uptime: process.uptime()

VERIFY: AE-MON-002 — Metrics endpoint tracks request counts and response times

MetricsController exposes incrementRequest(duration) and incrementError()
methods for internal use.

## Correlation IDs

### CorrelationIdMiddleware

Applied to all routes. Generates a correlation ID for each request
using createCorrelationId() from @repo/shared. Sets X-Correlation-ID
header on the request if not already present.

VERIFY: AE-MON-003 — Correlation ID middleware generates and attaches IDs

## Structured Logging

### RequestLoggingMiddleware

Uses formatLogEntry() from @repo/shared with Pino for structured
JSON logging. Logs:
- HTTP method and URL
- Status code and response time
- Correlation ID
- User agent

VERIFY: AE-MON-004 — Request logging uses Pino structured JSON format

## Error Handling

### GlobalExceptionFilter

Catches all exceptions (decorated with @Catch()):
- Extracts HTTP status from HttpException or defaults to 500
- Sanitizes request body using sanitizeLogContext from @repo/shared
- Logs sanitized error context with correlation ID
- Returns standardized error response with correlationId

VERIFY: AE-MON-005 — Global exception filter sanitizes and includes correlationId

## Response Time Tracking

### ResponseTimeInterceptor (APP_INTERCEPTOR)

Applied globally. Measures request duration and sets X-Response-Time
header on every response.

VERIFY: AE-PERF-001 — Response time interceptor adds X-Response-Time header
