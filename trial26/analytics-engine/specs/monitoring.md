# Monitoring Specification

## Overview

The Analytics Engine provides structured logging, health checks, metrics, and request correlation for observability.

## Health Endpoints

### GET /health
Returns application health status.
```json
{ "status": "ok", "version": "1.0.0", "timestamp": "2024-01-01T00:00:00.000Z" }
```

### GET /health/ready
Returns readiness status (database connectivity).
```json
{ "status": "ready", "timestamp": "2024-01-01T00:00:00.000Z" }
```

### GET /metrics (authenticated)
Returns application metrics:
- Process uptime
- Memory usage (RSS, heap)
- Timestamp

## Structured Logging

- Pino JSON logger for structured output
- Log levels: info, warn, error
- No console.log in production code
- Sensitive data sanitized (passwords, tokens, secrets)

## Correlation IDs

- X-Correlation-ID header read from incoming requests
- If not present, UUID v4 generated
- Correlation ID included in all log entries for the request
- Correlation ID returned in response headers

## Request Logging

Each request logged with:
- correlationId
- HTTP method
- URL path
- Response time (via interceptor)

## Performance Monitoring

- Cache-Control headers on GET endpoints
- Pagination clamping prevents oversized queries
- Database connection pool monitoring via Prisma

## Verification

<!-- VERIFY: AE-MON-001 — Health endpoint returns valid JSON with status -->
<!-- VERIFY: AE-MON-002 — Readiness endpoint confirms database connectivity -->
<!-- VERIFY: AE-MON-003 — Correlation ID propagated through request lifecycle -->
<!-- VERIFY: AE-MON-004 — Pino structured JSON logging active -->
<!-- VERIFY: AE-MON-005 — Sensitive data excluded from logs -->
