# Monitoring Specification

## Overview

The Event Management Platform implements comprehensive monitoring through
health checks, structured logging, correlation ID propagation, response
time tracking, and metrics exposure.

## Health Checks

VERIFY: EM-MON-006 — Health controller is @Public() and returns status, version, timestamp

The health endpoint at GET /health returns:
- status: "ok"
- version: APP_VERSION from shared package
- timestamp: current ISO timestamp

The readiness endpoint at GET /health/ready additionally checks:
- database: "connected" or "disconnected" based on $queryRaw probe

Health endpoints are public (no auth required) but NOT exempt from rate
limiting — they use the default throttle limits.

See: infrastructure.md for Docker HEALTHCHECK
See: security.md for throttle policy

## Metrics

VERIFY: EM-MON-007 — Metrics controller is @Public() and returns uptime

GET /metrics returns:
- uptime: process uptime in seconds
- timestamp: current ISO timestamp
- memory: process memory usage

## Structured Logging

VERIFY: EM-MON-002 — formatLogEntry produces structured JSON log entries
VERIFY: EM-MON-003 — sanitizeLogContext redacts sensitive fields recursively
VERIFY: EM-MON-005 — Request logging middleware uses formatLogEntry from shared

All request/response cycles are logged with Pino in structured JSON format.
The formatLogEntry function from the shared package formats log entries with:
- timestamp
- level
- method, url, statusCode
- responseTime
- correlationId
- Sanitized context (sensitive fields redacted)

See: security.md for log sanitization

## Correlation ID Propagation

VERIFY: EM-MON-004 — Correlation ID middleware preserves or generates X-Correlation-ID

Every request gets a correlation ID:
1. If the client sends X-Correlation-ID, it is preserved
2. Otherwise, a new UUID is generated via createCorrelationId()
3. The ID is attached to the request object
4. The ID is returned in the X-Correlation-ID response header
5. The ID is included in error responses (correlationId field)

See: cross-layer.md for correlation ID integration tests
See: security.md for error response format

## Response Time Tracking

VERIFY: EM-PERF-004 — Response time interceptor sets X-Response-Time header

The ResponseTimeInterceptor measures request duration using Date.now()
delta and sets the X-Response-Time header in the format "{N}ms".

See: performance.md for response time SLOs

## Log Sanitization

VERIFY: EM-MON-001 — Log sanitizer redacts sensitive fields recursively

The sanitizeLogContext function from the shared package:
- Redacts 13+ sensitive field names (password, token, secret, authorization, etc.)
- Handles nested objects recursively
- Handles arrays with recursive element processing
- Returns sanitized copy without modifying the original

See: security.md for sensitive data handling
