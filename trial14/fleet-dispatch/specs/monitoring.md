# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive monitoring through correlation IDs,
structured logging, request/response tracking, health checks, and metrics
endpoints. The monitoring pipeline provides full request traceability from
ingress to response.

## Correlation ID Generation

<!-- VERIFY: FD-MON-001 -->
The `createCorrelationId()` function in the shared package generates unique
correlation IDs using `crypto.randomUUID()`. Each incoming request receives a
correlation ID that propagates through the entire request lifecycle, enabling
end-to-end request tracing across logs and error responses.

## Structured Log Format

<!-- VERIFY: FD-MON-002 -->
The `formatLogEntry()` function in the shared package creates structured log
entries with consistent fields: timestamp (ISO 8601), level, message, and
optional context. The function returns a JSON-serializable object suitable
for consumption by log aggregation systems like ELK or Datadog.

## Application Version Tracking

<!-- VERIFY: FD-MON-003 -->
The shared constants export `APP_VERSION` (value: '1.0.0') which is included
in health check responses. This enables operators to verify which application
version is running in each environment and detect deployment drift across
instances.

## Global Exception Filter

<!-- VERIFY: FD-MON-004 -->
The `GlobalExceptionFilter` catches all unhandled exceptions and:
- Extracts the correlation ID from the request
- Logs the error with sanitized context (via `sanitizeLogContext()`)
- Returns a structured error response with correlationId, statusCode, message,
  and timestamp
- Maps known exception types to appropriate HTTP status codes
- Prevents stack traces from leaking to clients in production

## Correlation ID Middleware

<!-- VERIFY: FD-MON-005 -->
The `CorrelationIdMiddleware` runs on every incoming request. It checks for an
existing `x-correlation-id` header and uses it if present; otherwise, it generates
a new correlation ID via `createCorrelationId()`. The ID is stored on the request
object and set as a response header, enabling distributed tracing across services.

## Request Logging Middleware

<!-- VERIFY: FD-MON-006 -->
The `RequestLoggingMiddleware` logs every request with structured data:
- HTTP method and URL
- Response status code
- Request duration in milliseconds
- Correlation ID for traceability
- User agent and IP address (sanitized)

Logs are formatted using `formatLogEntry()` from the shared package and output
to stdout for container log collection.

## Health and Readiness Endpoints

<!-- VERIFY: FD-MON-007 -->
The `MonitoringService` provides three monitoring methods:
- `getHealth()`: Returns application status and APP_VERSION from shared constants
- `getReadiness()`: Executes `$queryRaw(SELECT 1)` to verify database connectivity
- `getMetrics()`: Returns basic application metrics including uptime and memory usage

The readiness check enables Kubernetes-style health probes to detect database
connectivity issues before routing traffic to the instance.

## Monitoring Controller — Public Access

<!-- VERIFY: FD-MON-008 -->
The `MonitoringController` exposes three endpoints:
- `GET /monitoring/health` — Application liveness
- `GET /monitoring/readiness` — Database connectivity
- `GET /monitoring/metrics` — Runtime metrics

ALL methods are decorated with `@Public()` and `@SkipThrottle()`. Monitoring
endpoints must be accessible without authentication for infrastructure health
checking (load balancers, container orchestrators, uptime monitors). Rate
limiting is skipped to prevent health check failures under load.

## Cross-References

- Log sanitization prevents sensitive data leakage: see [security.md](security.md) (FD-SEC-005)
- Correlation IDs included in error responses: see [cross-layer.md](cross-layer.md) (FD-CROSS-001)
- Health check used by Docker HEALTHCHECK directive: see [infrastructure.md](infrastructure.md)
- Response time tracking for performance monitoring: see [cross-layer.md](cross-layer.md) (FD-PERF-002)

## Logging Best Practices

The API source code (`apps/api/src/**/*.ts`) uses structured logging through
the monitoring infrastructure. Direct `console.log` calls are prohibited in
API source code — all logging flows through the structured logging pipeline
to ensure consistent format, sanitization, and correlation ID inclusion.

## Alert Conditions

The monitoring endpoints enable alerting on:
- Health endpoint returning non-200: application crash or deadlock
- Readiness endpoint returning non-200: database connectivity loss
- Response time headers exceeding thresholds: performance degradation
- Error rate spikes visible in structured logs: application errors
