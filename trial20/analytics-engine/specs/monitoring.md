# Monitoring Specification

## Overview

The Analytics Engine provides comprehensive monitoring through health endpoints,
metrics collection, structured logging, and request tracing. All monitoring
endpoints are publicly accessible to support container orchestration probes
without requiring authentication.

See also: infrastructure.md for Docker HEALTHCHECK configuration.
See also: security.md for log sanitization and correlation ID details.

## Health Endpoints

### GET /health
- Public: Yes (@Public decorator, subject to rate limiting)
- Response: { status: 'ok', timestamp, uptime, version }
- Purpose: Liveness probe for container orchestration

### GET /health/ready
- Public: Yes
- Response: { status: 'ok', database: 'connected', timestamp }
- Purpose: Readiness probe that verifies database connectivity
- Implementation: Uses $queryRaw`SELECT 1` to verify connection

VERIFY: AE-MON-001 — Health endpoint returns status, timestamp, uptime, and version
VERIFY: AE-MON-002 — Readiness endpoint verifies database connectivity
VERIFY: AE-MON-003 — Health endpoints are publicly accessible without authentication

## Metrics Endpoint

### GET /metrics
- Public: Yes
- Response: { requestCount, errorCount, uptime, avgResponseTime }
- Purpose: Basic application metrics for monitoring dashboards

VERIFY: AE-MON-004 — Metrics endpoint exposes request count and error count
VERIFY: AE-MON-005 — Metrics endpoint is publicly accessible

## Request Tracing

### Correlation ID
- Generated via createCorrelationId() from shared package (randomUUID)
- Applied by CorrelationIdMiddleware to every request
- Included in X-Correlation-ID response header
- Included in error responses for debugging

VERIFY: AE-MON-006 — Correlation ID generated for every request via middleware
VERIFY: AE-MON-007 — Correlation ID included in response headers

### Response Time
- Measured by ResponseTimeInterceptor (APP_INTERCEPTOR)
- Applied to X-Response-Time response header
- Value in milliseconds calculated via Date.now() delta

VERIFY: AE-MON-008 — Response time measured and included in headers

## Structured Logging

- Pino logger for structured JSON output
- formatLogEntry from shared package for consistent format
- sanitizeLogContext strips sensitive fields from log context
- Fields: timestamp, level, correlationId, method, path, statusCode, duration

VERIFY: AE-MON-009 — Structured logging uses Pino with log sanitization

### Sensitive Field Handling
- sanitizeLogContext recursively processes objects and arrays
- SENSITIVE_KEYS: password, passwordHash, token, accessToken, refreshToken,
  authorization, cookie, secret, connectionString
- Replaced with '[REDACTED]' in log output

## Request Logging Middleware

- Logs every request with method, path, and correlation ID
- Logs response with status code and duration
- Uses formatLogEntry for structured format
- Applied globally via middleware consumer in AppModule

## Alerting Integration Points

- Health endpoint for liveness checks (Docker HEALTHCHECK)
- Ready endpoint for readiness probes (Kubernetes/Docker)
- Metrics endpoint for Prometheus/Grafana integration
- Structured logs for ELK/CloudWatch ingestion
