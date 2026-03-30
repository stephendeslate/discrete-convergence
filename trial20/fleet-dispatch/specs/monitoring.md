# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive monitoring with health endpoints,
structured JSON logging via pino, request correlation, response time tracking,
and metrics collection. All monitoring endpoints are public (@Public).

Cross-references: [infrastructure.md](infrastructure.md), [api-endpoints.md](api-endpoints.md)

## Health Endpoints

### GET /health
- Public (no authentication required)
- Returns: { status: 'ok', timestamp, uptime, version }
- version sourced from shared APP_VERSION constant
- Used by Docker HEALTHCHECK

### GET /health/ready
- Public (no authentication required)
- Performs database connectivity check via $queryRaw`SELECT 1`
- Returns: { database: 'connected' | 'disconnected', timestamp }
- Graceful handling of database connection failures

## Metrics Endpoint

### GET /metrics
- Public (no authentication required)
- Returns: { requests, errors, averageResponseTime, uptime }
- Tracks total request count, error count, and cumulative response time
- averageResponseTime calculated as totalResponseTime / requestCount

## Structured Logging

- Logger: pino with JSON output format
- Log levels: info, error, warn
- NO console.log usage anywhere in codebase
- formatLogEntry() from shared package for consistent structure
- sanitizeLogContext() strips passwords, tokens, secrets from logs
- Log fields: correlationId, method, path, statusCode, duration

## Correlation ID

- CorrelationIdMiddleware generates unique IDs for each request
- Uses createCorrelationId() from shared package
- Propagated via X-Correlation-ID header
- Included in error responses for traceability
- Can be passed by client for end-to-end tracing

## Response Time Tracking

- ResponseTimeInterceptor measures request duration
- Sets X-Response-Time header on all responses
- Duration calculated in milliseconds
- Used for performance monitoring and alerting

## Request Logging

- RequestLoggingMiddleware logs all incoming requests
- Logs method, path, correlationId on request start
- Logs statusCode, duration on request completion (via 'finish' event)
- Uses pino structured logging with formatLogEntry()

Cross-references: [security.md](security.md), [performance.md](performance.md)

## VERIFY Tags

- VERIFY: FD-MON-001 — Correlation ID middleware generates unique IDs
- VERIFY: FD-MON-002 — Request logging middleware uses pino
- VERIFY: FD-MON-003 — Response time interceptor measures duration
- VERIFY: FD-MON-004 — Structured logging sanitizes sensitive fields
- VERIFY: FD-MON-005 — Log sanitizer handles nested objects and arrays
- VERIFY: FD-MON-006 — Pagination utility clamps page and limit values
- VERIFY: FD-MON-007 — Health endpoint returns status and version
- VERIFY: FD-MON-008 — Metrics endpoint exposes request counts

## Alerting Strategy

- Health check failure triggers container restart (Docker HEALTHCHECK)
- Database disconnection logged at error level
- High error rate detectable via metrics endpoint
- CI pipeline reports test and build failures
