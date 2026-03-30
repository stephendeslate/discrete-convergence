# Monitoring Specification

## Overview

The Event Management platform provides health check, readiness, and metrics endpoints
for container orchestration and observability.
Monitoring endpoints are publicly accessible without authentication.
Monitoring integrates with the infrastructure described in [infrastructure.md](infrastructure.md).

## Requirements

### EM-MON-001 — Health Check
GET /health returns { status: 'ok' } with 200 status.
No authentication required. Available for load balancer health probes.
Response includes version and timestamp fields.
<!-- VERIFY:EM-MON-001 — Health endpoint returns status ok without authentication -->

### EM-MON-002 — Readiness Check
GET /health/ready checks database connectivity via PrismaService.$queryRaw.
Returns { status: 'ready', database: 'ok' } on success.
Returns { status: 'not_ready', database: 'error' } on failure.
Used by container orchestrators to determine if the service is ready to accept traffic.
<!-- VERIFY:EM-MON-002 — Readiness endpoint verifies database connectivity -->

### EM-MON-003 — Metrics
GET /health/metrics returns application metrics:
uptime (seconds), memory usage (rss, heapUsed, heapTotal), timestamp.
Used for monitoring dashboards and alerting.
<!-- VERIFY:EM-MON-003 — Metrics endpoint reports uptime and memory usage -->

### EM-MON-004 — Correlation IDs
CorrelationInterceptor generates UUID v4 for each request.
Correlation ID propagated via X-Correlation-ID response header.
If client sends X-Correlation-ID header, it is preserved.
Included in all error responses for request tracing.
<!-- VERIFY:EM-MON-004 — Correlation ID generated and propagated in responses -->

### EM-MON-005 — Response Time
ResponseTimeInterceptor measures request duration in milliseconds.
X-Response-Time header added to all responses.
Format: "{duration}ms" (e.g., "12ms").
<!-- VERIFY:EM-MON-005 — Response time measured and reported in header -->

### EM-MON-006 — Structured Logging
LoggerModule with nestjs-pino provides structured JSON logging.
Log sanitizer strips sensitive fields (password, token, authorization).
Request ID is correlated with correlation ID from headers.
Production mode outputs plain JSON; development mode uses pino-pretty.
<!-- VERIFY:EM-MON-006 — Structured logging with sensitive field sanitization -->

## Integration with Infrastructure

- Docker HEALTHCHECK uses the /health endpoint (see [infrastructure.md](infrastructure.md))
- Docker Compose health checks depend on database readiness
- CI pipeline validates health endpoints are functional
