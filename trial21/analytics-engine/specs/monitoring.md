# Monitoring Specification

## Overview

The analytics engine implements structured observability through Pino JSON logging,
correlation IDs, response time tracking, and a metrics endpoint.

Cross-reference: See [infrastructure.md](infrastructure.md) for deployment configuration.
Cross-reference: See [security.md](security.md) for metrics endpoint access control.

## Structured Logging

- Pino library for JSON-structured logging
- Log levels: error, warn, info, debug
- Sensitive fields automatically redacted via sanitizeLogContext()
- Each log entry includes timestamp and correlation ID

## Request Tracing

### Correlation ID Middleware
- Generates UUID for each request if not provided
- Preserves incoming X-Correlation-ID header
- Sets X-Correlation-ID response header

### Response Time Interceptor
- Applied globally via APP_INTERCEPTOR
- Measures request processing duration
- Sets X-Response-Time header (e.g., "42ms")

## VERIFY Tags

VERIFY: AE-MON-001 — correlation ID generation via createCorrelationId
VERIFY: AE-MON-002 — structured logging format with formatLogEntry
VERIFY: AE-MON-003 — response time tracking via interceptor
VERIFY: AE-MON-004 — correlation ID middleware for request tracing
VERIFY: AE-MON-005 — metrics endpoint restricted to ADMIN role
VERIFY: AE-MON-006 — metrics include tenant counts and system stats

## Metrics Endpoint

GET /metrics returns:
- tenants: total tenant count
- dashboards: total dashboard count
- widgets: total widget count
- dataSources: total data source count
- uptime: process uptime in seconds
- memory: process memory usage
- timestamp: ISO 8601 timestamp

## Health Endpoints

GET /health: basic health check (public)
GET /health/ready: readiness with uptime (public)

Both endpoints are @Public() but NOT @SkipThrottle() — they are subject to
the global throttler rate limits.

## Edge Cases

VERIFY: AE-MON-007 — missing correlation ID header generates new UUID
VERIFY: AE-MON-008 — response time header format matches \d+ms pattern
VERIFY: AE-MON-009 — non-admin user denied access to metrics endpoint
