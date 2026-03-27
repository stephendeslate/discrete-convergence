# Monitoring Specification

## Overview
Health checks, readiness probes, metrics, correlation tracking, and structured logging.

### VERIFY: FD-MON-001 — Health endpoint at /health (public)
GET /health returns { status: 'ok', version, timestamp }. Decorated with @Public() — no auth required.
The `version` field is sourced from APP_VERSION in the shared constants package.
The `timestamp` field is the current ISO 8601 datetime string.
This endpoint is used by Docker HEALTHCHECK, Kubernetes liveness probes, and load balancers.
Response time should be under 10ms as it performs no I/O operations.
The endpoint must always return HTTP 200 as long as the process is running.
Used for liveness checks to determine if the application process is responsive.

### VERIFY: FD-MON-002 — Readiness probe at /health/ready (public)
GET /health/ready checks database connectivity with timeout. Returns status 'ok' or 'degraded' with database connection status.
The probe executes `SELECT 1` against PostgreSQL with a timeout of HEALTH_CHECK_TIMEOUT milliseconds.
If the database is unreachable, returns `{ status: 'degraded', database: 'disconnected' }` with HTTP 200.
The 200 status code for degraded state allows orchestrators to distinguish between app crashes and dependency issues.
Kubernetes uses this endpoint for readiness probes — a degraded app stops receiving traffic but is not restarted.
Unlike the liveness probe at /health, this endpoint performs actual I/O to verify downstream dependencies.

### VERIFY: FD-MON-003 — Metrics endpoint at /metrics (protected)
GET /metrics requires JWT auth. Returns process uptime, memory usage, and entity counts (vehicles, drivers, dispatch jobs).
Memory usage includes rss, heapTotal, heapUsed, and external from `process.memoryUsage()`.
Entity counts are obtained via Prisma `count()` queries scoped to the authenticated user's tenant.
The endpoint is protected to prevent exposure of infrastructure metrics to unauthenticated users.
Response shape: `{ version, uptime, memory, counts: { vehicles, drivers, dispatchJobs }, timestamp }`.
Entity counts provide operational visibility into the tenant's data volume.

### VERIFY: FD-MON-004 — CorrelationInterceptor reads X-Correlation-ID
Global APP_INTERCEPTOR reads X-Correlation-ID from request headers. Generates a new UUID if not present. Sets it in the response header.
The interceptor uses `crypto.randomUUID()` for generating new correlation IDs when the header is absent.
The correlation ID is propagated through all log entries for the request lifecycle.
This enables end-to-end distributed tracing across microservices and API gateways.
Security events from the middleware described in [security.md](security.md) include correlation IDs for tracing.

### VERIFY: FD-MON-005 — Structured error logging
GlobalExceptionFilter logs errors with method, URL, status code, and stack trace. Sensitive values are redacted via sanitizeLogValue().
The filter catches all unhandled exceptions and logs them with full context before returning a sanitized response.
Logged fields: HTTP method, URL path, status code, error message, stack trace, correlation ID.
The sanitizeLogValue() function redacts fields containing: password, token, secret, authorization, cookie.
Client-facing error responses never include stack traces or internal implementation details.

### VERIFY: FD-MON-006 — Logger instances per service
Each service and controller uses NestJS Logger with the class name as context for structured log output.
Pattern: `private readonly logger = new Logger(ClassName.name)`.
The class name context enables filtering and searching logs by service in production environments.
Log levels used: `log` (info), `warn` (warnings), `error` (errors with stack traces), `debug` (development only).
All log output is written to stdout/stderr for container-friendly log collection.
In production, logs are plain text suitable for structured log parsing and aggregation.
Debug-level logs are suppressed in production via the NestJS logger configuration.
Each service creates its logger in the constructor: `private readonly logger = new Logger(ClassName.name)`.
Consistent logger usage enables efficient log analysis and alerting in production environments.
Error logs always include the full stack trace for debugging, while info logs provide operational context.
