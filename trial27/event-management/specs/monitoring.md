# Monitoring Specification

## Overview
Health checks, metrics, logging, and correlation ID tracing.

### VERIFY: EM-MON-001 — Health endpoint at GET /health (public)
Public health check endpoint returns `{ status: 'ok', version, uptime }`. Not at `/monitoring/health`.
The endpoint is decorated with `@Public()` to bypass JWT authentication.
The `version` field is sourced from the `APP_VERSION` constant in the shared package.
The `uptime` field returns `process.uptime()` in seconds.
Used by Docker HEALTHCHECK and load balancer health probes.
Response time should be under 10ms as it performs no database or external I/O operations.
The endpoint must always return HTTP 200 as long as the process is running.

### VERIFY: EM-MON-002 — Correlation ID interceptor reads X-Correlation-ID header
`CorrelationInterceptor` registered as `APP_INTERCEPTOR` reads `x-correlation-id` from request headers. If absent, generates a new UUID. Sets the correlation ID on the response header.
The correlation ID is propagated to all log entries for request tracing.
Implementation uses `crypto.randomUUID()` for generating new correlation IDs.
This enables end-to-end request tracing across services in distributed environments.
Security events from the middleware described in [security.md](security.md) are logged with correlation IDs.
The correlation ID is stored on the request object for access by downstream services and controllers.
Format: standard UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`).

### VERIFY: EM-MON-003 — sanitizeLogValue redacts sensitive fields
The `sanitizeLogValue()` function from shared package redacts values for keys containing password, token, secret, authorization, or cookie.
Redacted values are replaced with `[REDACTED]` in log output.
The function performs case-insensitive matching on field names.
This prevents sensitive data from appearing in log files, console output, or log aggregation services.
Applied in the GlobalExceptionFilter and any service that logs request/response data.
The function is unit tested to ensure all sensitive patterns are properly caught.

### VERIFY: EM-MON-004 — Readiness probe at GET /health/ready with DB check
Public endpoint that probes database connectivity via `SELECT 1`. Returns `{ status: 'ok', database: 'connected' }` or `{ status: 'degraded', database: 'disconnected' }`.
The query has a timeout of `HEALTH_CHECK_TIMEOUT` milliseconds from the shared constants.
If the database query times out or throws an error, the endpoint still returns 200 with degraded status.
This allows orchestrators to distinguish between application health and dependency health.
Kubernetes and Docker Compose use this endpoint for readiness probes.
Unlike the health endpoint, the readiness probe performs actual I/O to verify database connectivity.

### VERIFY: EM-MON-005 — Protected metrics endpoint at GET /metrics
Returns version, uptime, memory usage, and timestamp. Requires JWT authentication.
Memory usage is obtained from `process.memoryUsage()` and includes rss, heapTotal, heapUsed, and external.
The endpoint is protected because metrics data could reveal infrastructure details to attackers.
Response shape: `{ version, uptime, memory: { rss, heapTotal, heapUsed, external }, timestamp }`.
This endpoint can be polled by monitoring dashboards for real-time application observability.
Memory values are reported in bytes for precision.

### VERIFY: EM-MON-006 — Logger used across all services
All services use NestJS `Logger` with service name context for structured logging.
Each service creates a logger instance: `private readonly logger = new Logger(ServiceName.name)`.
Log levels used: `log` for info, `warn` for warnings, `error` for errors with stack traces.
The logger context enables filtering logs by service in production log aggregation tools.
All log output is written to stdout/stderr for container-friendly log collection.
In development, NestJS formats logs with color coding for readability.
In production, logs are emitted as plain text suitable for structured log parsers.
