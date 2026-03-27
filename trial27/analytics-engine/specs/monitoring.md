# Monitoring Specification

## Overview

The Analytics Engine provides health checks, application metrics,
structured logging, and request correlation for observability.

## Health Checks

### VERIFY: AE-MON-001 — Health endpoint
GET /health returns a JSON response with:
- status: "ok"
- timestamp: ISO 8601 timestamp
- service: "analytics-engine-api"

This endpoint is public and does not require authentication.

### VERIFY: AE-MON-002 — Readiness endpoint
GET /health/ready returns a JSON response with:
- status: "ok" or "degraded"
- database: "connected" or "disconnected"
- timestamp: ISO 8601 timestamp

This endpoint probes the database connection using `SELECT 1`.

## Metrics

### VERIFY: AE-MON-003 — Metrics endpoint
GET /metrics returns application metrics including:
- uptime: process uptime in seconds
- memory: process memory usage
- timestamp: ISO 8601 timestamp

This endpoint requires authentication.

## Logging

### VERIFY: AE-MON-004 — Structured logging
All application logs use pino for structured JSON output.
Log entries include:
- level: info, warn, error
- timestamp: automatic
- correlationId: from request header or generated
- method: HTTP method
- url: request URL

## Correlation IDs

### VERIFY: AE-MON-005 — Correlation ID tracking
The CorrelationInterceptor:
1. Reads X-Correlation-ID from incoming request header
2. If not present, generates a unique correlation ID
3. Sets the correlation ID on the response header
4. Includes the correlation ID in log context

This enables end-to-end request tracing across services.

## Error Tracking

### VERIFY: AE-MON-006 — Error logging
The GlobalExceptionFilter logs all 500 Internal Server Error responses
with the request path, method, and error message using pino logger.
Client errors (4xx) are not logged to reduce noise.

## Performance Monitoring

Response time is tracked via the correlation interceptor timestamps.
Pagination clamping prevents unbounded queries.
Database health is continuously monitored via the readiness endpoint.

## Cross-References

- Health endpoint contracts: See [api-endpoints.md](api-endpoints.md)
- Infrastructure deployment: See [infrastructure.md](infrastructure.md)
- Security logging: See [security.md](security.md)
