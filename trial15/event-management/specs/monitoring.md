# Monitoring Specification

## Overview

The event management platform implements comprehensive monitoring with structured logging,
correlation ID tracking, health checks, metrics collection, and error sanitization.
All monitoring components use shared utilities from the packages/shared module.

## Correlation ID Tracking

CorrelationIdMiddleware preserves client-provided X-Correlation-ID header or generates
a new UUID using createCorrelationId from the shared package. This ID is attached to
all log entries and error responses for request tracing.

- VERIFY: EM-MON-001 — createCorrelationId generates UUID using randomUUID
- VERIFY: EM-MON-002 — LogEntry interface defines structured log format
- VERIFY: EM-MON-003 — formatLogEntry creates JSON-structured log strings

## Request Logging

RequestLoggingMiddleware logs every request with method, URL, status code, duration,
and correlation ID using formatLogEntry from shared.

## Log Sanitization

sanitizeLogContext from shared redacts sensitive fields in log output:
- Redacted keys: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive matching
- Deep nested object traversal
- Array recursion support

- VERIFY: EM-MON-004 — sanitizeLogContext redacts sensitive keys recursively
- VERIFY: EM-MON-005 — GlobalExceptionFilter sanitizes errors, includes correlationId

## Request Context

RequestContextService is request-scoped, storing correlationId, userId, and tenantId
for the duration of each request.

- VERIFY: EM-MON-006 — CorrelationIdMiddleware preserves or generates correlation IDs
- VERIFY: EM-MON-007 — RequestLoggingMiddleware logs method, URL, status, duration
- VERIFY: EM-MON-008 — RequestContextService is request-scoped with correlation data

## Health Endpoints

All health and metrics endpoints are @Public() and @SkipThrottle() exempt.

### GET /health
Returns status, timestamp, uptime (seconds), and version from APP_VERSION shared constant.

### GET /health/ready
Executes `$queryRaw SELECT 1` to verify database connectivity.

### GET /metrics
Returns in-memory request count, error count, average response time, and uptime.

- VERIFY: EM-MON-009 — MonitoringController exposes /health, /health/ready, /metrics as @Public

## Cross-References

- See [security.md](security.md) for error handling and global exception filter
- See [infrastructure.md](infrastructure.md) for health check in Dockerfile
- See [authentication.md](authentication.md) for correlation ID in auth error responses
- See [cross-layer.md](cross-layer.md) for full pipeline verification
