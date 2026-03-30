# Monitoring Specification

## Overview

Structured logging, correlation tracking, response time measurement,
and health check endpoints for production observability.

## Health Endpoints

### GET /health
- Public endpoint (no JWT required)
- No @SkipThrottle (subject to global rate limiting)
- Returns: `{ status: 'ok' }`
- Target: < 200ms p95

### GET /health/ready
- Public endpoint
- Executes `SELECT 1` against PostgreSQL
- Returns: `{ database: 'connected' }`
- Target: < 500ms p95

## Correlation IDs

Every request receives an X-Correlation-ID header via CorrelationIdMiddleware.
If the client provides one, it is preserved. Otherwise, a UUID is generated
using createCorrelationId from shared.

VERIFY: EM-MON-001 — CorrelationIdMiddleware sets X-Correlation-ID on all requests
VERIFY: EM-MON-002 — RequestLoggingMiddleware logs method, URL, status with pino
VERIFY: EM-MON-003 — GlobalExceptionFilter includes correlationId in error response
VERIFY: EM-MON-004 — HealthController exposes /health and /health/ready endpoints

## Request Logging

RequestLoggingMiddleware uses pino for structured JSON logging.
Log entries include:
- method, url, statusCode
- correlationId
- duration (ms)
- timestamp (ISO 8601)

Sensitive fields are redacted via sanitizeLogContext from shared.

## Performance Monitoring

VERIFY: EM-PERF-001 — ResponseTimeInterceptor adds X-Response-Time header
VERIFY: EM-PERF-004 — CacheControlInterceptor adds Cache-Control on GET endpoints

### Response Time
X-Response-Time header added to all responses via ResponseTimeInterceptor (APP_INTERCEPTOR).
Measures time from request start to response completion.

### Caching
CacheControlInterceptor applied to GET list endpoints via @UseInterceptors.
CacheModule registered globally in AppModule.

## Error Tracking

GlobalExceptionFilter catches all unhandled exceptions:
- Logs error with correlation ID and request context
- Returns sanitized error to client (no stack traces)
- HTTP exceptions preserve their status code
- Unknown errors return 500

## Related Specs

See [security.md](security.md) for error sanitization.
See [infrastructure.md](infrastructure.md) for Docker healthcheck.
See [api-endpoints.md](api-endpoints.md) for health endpoint details.
